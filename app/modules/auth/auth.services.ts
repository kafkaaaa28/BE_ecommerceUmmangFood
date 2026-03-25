import { rlRequestOtpByEmail, rlRequestOtpByIp, rlVerifyOtpByEmail, rlVerifyOtpByIp } from '../lib/otp/otplimiter.js';
import { OtpService } from '../lib/otp/otp.service.js';
import { UserRepository } from '../user/user.repository.js';
import type { User } from '../user/user.types.js';
import { AppError } from '../error/AppError.js';
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from '../lib/jwt/jwt.js';
import { randomUUID } from 'crypto';
import { sha256 } from '../lib/hash/hash.js';
import { AuthRepository } from './auth.repository.js';

type AuthResponse = {
  user: User;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
};

export class AuthService {
  constructor(private readonly userRepo: UserRepository) {}
  otpService = new OtpService();
  authRepo = new AuthRepository();
  async requestOtpLogin(email: string, ip: string): Promise<void> {
    try {
      await Promise.all([rlRequestOtpByIp.consume(ip), rlRequestOtpByEmail.consume(email)]);
    } catch (err: any) {
      const retryAfter = err.msBeforeNext / 1000;
      throw new AppError('TOO_MANY_REQUESTS', 429, `Please retry after ${Math.ceil(retryAfter)} seconds`);
    }
    const user = await this.userRepo.findByNormalizedEmail(email);
    if (user && user.status !== 'ACTIVE') return;
    await this.otpService.sendOtp(email, 'login');
  }

  async verifyOtpLogin(email: string, otp: string, ip: string): Promise<AuthResponse> {
    let userId: string | null = null;

    try {
      await Promise.all([rlVerifyOtpByIp.consume(ip), rlVerifyOtpByEmail.consume(email)]);
      await this.otpService.verifyOtp(email, otp, 'login');

      let user = await this.userRepo.findByNormalizedEmail(email);
      if (user) {
        userId = user.id;
        if (user.status !== 'ACTIVE') {
          throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'ACCOUNT_UNAVAILABLE');
        }
      } else {
        user = await this.userRepo.createByNormalizedEmail(email);
        userId = user.id;
      }
      const sessionId = randomUUID();
      const tokenVersion = 1;

      const accessToken = signAccessToken({
        sub: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        sessionId,
      });

      const refreshToken = signRefreshToken({
        sub: user.id,
        sessionId,
        tokenVersion,
      });
      await this.authRepo.saveSession(sessionId, {
        userId: user.id,
        refreshTokenHash: sha256(refreshToken),
        tokenVersion,
        ip: ip,
      });

      await this.recordLoginEvent({
        userId,
        email,
        ipAddress: ip,
        success: true,
        reason: 'LOGIN_SUCCESS',
      });

      return {
        user,
        accessToken,
        refreshToken,
        accessTokenExpiresInSeconds: 60,
        refreshTokenExpiresInSeconds: 60 * 60 * 24 * 3,
      };
    } catch (error) {
      const reason = error instanceof AppError ? (error.code ?? error.message) : 'LOGIN_FAILED_INTERNAL_ERROR';

      await this.recordLoginEvent({
        userId,
        email,
        ipAddress: ip,
        success: false,
        reason,
      });

      throw error;
    }
  }

  private async recordLoginEvent(params: { userId: string | null; email: string; ipAddress: string; success: boolean; reason: string }) {
    try {
      await this.userRepo.createLoginEvent({
        userId: params.userId,
        email: params.email,
        provider: 'EMAIL',
        success: params.success,
        reason: params.reason,
        ipAddress: params.ipAddress,
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to persist login event', error);
      }
    }
  }

  async refresh(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') {
      throw new AppError('INVALID_TOKEN', 401, 'Invalid token type');
    }
    const session = await this.authRepo.getSession(payload.sessionId);

    if (!session) {
      throw new AppError('SESSION_NOT_FOUND', 401, 'Session not found');
    }
    const incomingHash = sha256(refreshToken);
    if (session.refreshTokenHash !== incomingHash || session.tokenVersion !== payload.tokenVersion) {
      throw new AppError('INVALID_TOKEN', 401, 'Invalid refresh token');
    }
    const user = await this.userRepo.findById(session.userId);

    if (!user) {
      await this.authRepo.deleteSession(payload.sessionId);
      throw new AppError('USER_NOT_FOUND', 404, 'User not found');
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: payload.sessionId,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      accessToken,
      refreshToken,
      accessTokenExpiresInSeconds: 60,
      refreshTokenExpiresInSeconds: 60 * 60 * 24 * 3,
    };
  }
  async logoutCurrent(sessionId: string): Promise<void> {
    await this.authRepo.deleteSession(sessionId);
  }
}
