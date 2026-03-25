import { redisClient } from '../../config/redis.config.js';

type SessionRecord = {
  userId: string;
  refreshTokenHash: string;
  tokenVersion: number;
  ip?: string;
};

const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 3;
const sessionKey = (sessionId: string) => `auth:session:${sessionId}`;

export class AuthRepository {
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
}
