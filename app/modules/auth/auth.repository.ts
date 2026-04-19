import { redisClient } from '../../config/redis.config.js';
import { prisma } from '../../config/prisma.js';
import crypto from 'crypto';
import { UserRepository } from '../user/user.repository.js';
import type { CreateLoginEventInput, OAuthAccountInput } from './auth.types.js';
type SessionRecord = {
  userId: string;
  refreshTokenHash: string;
  tokenVersion: number;
  ip?: string;
};

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 3;
const sessionKey = (sessionId: string) => `auth:session:${sessionId}`;

export class AuthRepository {
  userRepo = new UserRepository();
  async saveSession(sessionId: string, record: SessionRecord): Promise<void> {
    await redisClient.setex(sessionKey(sessionId), REFRESH_TTL_SECONDS, JSON.stringify(record));
  }

  async getSession(sessionId: string): Promise<SessionRecord | null> {
    const raw = await redisClient.get(sessionKey(sessionId));
    if (!raw) return null;
    return JSON.parse(raw) as SessionRecord;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await redisClient.del(sessionKey(sessionId));
  }

  async touchSession(sessionId: string): Promise<void> {
    await redisClient.expire(sessionKey(sessionId), REFRESH_TTL_SECONDS);
  }
  async createGoogleUser(input: { normalizedEmail: string; name?: string | null; image?: string | null }) {
    return prisma.user.create({
      data: {
        normalizedEmail: input.normalizedEmail,
        email: input.normalizedEmail,
        name: input.name ?? null,
        image: input.image ?? null,
      },
      select: { id: true, email: true, name: true, role: true, image: true, status: true },
    });
  }
  async updateGoogleUser(userId: string, input: { name?: string | null; image?: string | null }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.name !== undefined ? { name: input.name ?? null } : {}),
        ...(input.image !== undefined ? { image: input.image ?? null } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        image: true,
        status: true,
      },
    });
  }
  async upsertOAuthAccount(userId: string, account: OAuthAccountInput) {
    return prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
      },
      create: {
        userId,
        type: account.type,
        provider: account.provider,
        providerAccountId: account.providerAccountId,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      },
      update: {
        userId,
        type: account.type,
        refresh_token: account.refresh_token ?? null,
        access_token: account.access_token ?? null,
        expires_at: account.expires_at ?? null,
        token_type: account.token_type ?? null,
        scope: account.scope ?? null,
        id_token: account.id_token ?? null,
        session_state: account.session_state ?? null,
      },
    });
  }
  async createLoginEvent(input: CreateLoginEventInput) {
    return prisma.loginEvent.create({
      data: {
        id: crypto.randomUUID(),
        userId: input.userId ?? null,
        email: input.email ?? null,
        provider: input.provider,
        success: input.success,
        reason: input.reason,
        ipAddress: input.ipAddress,
      },
    });
  }
}
