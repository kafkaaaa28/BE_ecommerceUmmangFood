import { AppError } from '../error/AppError.js';
import { rlRequestOtpByEmail, rlRequestOtpByIp, rlVerifyOtpByEmail, rlVerifyOtpByIp } from '../lib/otp/otplimiter.js';
import { UserRepository } from './user.repository.js';
import { OtpService } from '../lib/otp/otp.service.js';
type UpdateProfileInput = {
  name?: string;
  phone?: string;
  image?: string;
};

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}
  otpService = new OtpService();

  async getProfile(userId: string) {
    const user = await this.userRepo.findProfileById(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND');
    if (user.status !== 'ACTIVE') throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'ACCOUNT_UNAVAILABLE');
    return user;
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.userRepo.findProfileById(userId);
    if (!user) throw new AppError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND');
    if (user.status !== 'ACTIVE') throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'ACCOUNT_UNAVAILABLE');

    const nextInput = input.phone !== undefined && input.phone !== user.phone ? { ...input, phoneVerifiedAt: null } : input;

    try {
      return await this.userRepo.updateProfileById(userId, nextInput);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new AppError('PHONE_ALREADY_USED', 409, 'PHONE_ALREADY_USED');
      }
      throw error;
    }
  }
  async requestPhoneVerificationOtp(email: string, phone: string, ip: string) {
    try {
      await Promise.all([rlRequestOtpByIp.consume(ip), rlRequestOtpByEmail.consume(email)]);
    } catch (err: any) {
      const retryAfter = err?.msBeforeNext ? Math.ceil(err.msBeforeNext / 1000) : 60;
      throw new AppError('TOO_MANY_REQUESTS', 429, `Please retry after ${retryAfter} seconds`);
    }

    const user = await this.userRepo.findByNormalizedEmail(email);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'ACCOUNT_UNAVAILABLE');
    }

    const identifier = `${email}:${phone}`;
    await this.otpService.sendOtp(email, 'phone_verification', identifier);
  }
  async verifyPhoneOtp(phone: string, email: string, otp: string, ip: string) {
    try {
      await Promise.all([rlVerifyOtpByIp.consume(ip), rlVerifyOtpByEmail.consume(email)]);
    } catch (err: any) {
      const retryAfter = err?.msBeforeNext ? Math.ceil(err.msBeforeNext / 1000) : 60;
      throw new AppError('TOO_MANY_REQUESTS', 429, `Please retry after ${retryAfter} seconds`);
    }

    const user = await this.userRepo.findByNormalizedEmail(email);
    if (!user) {
      throw new AppError('USER_NOT_FOUND', 404, 'USER_NOT_FOUND');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_UNAVAILABLE', 403, 'ACCOUNT_UNAVAILABLE');
    }

    const identifier = `${email}:${phone}`;
    await this.otpService.verifyOtp(identifier, otp, 'phone_verification');

    try {
      return await this.userRepo.verifyPhoneOtp(phone, email);
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new AppError('PHONE_ALREADY_USED', 409, 'PHONE_ALREADY_USED');
      }
      throw error;
    }
  }
}
