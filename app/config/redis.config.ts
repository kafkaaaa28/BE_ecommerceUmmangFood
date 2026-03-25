import { Redis } from 'ioredis';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env variable: ${name}`);
  }
  return value;
}
export const redisClient = new Redis(requireEnv('REDIS_URL'), {
  maxRetriesPerRequest: null,
});
export const connectRedis = async () => {
  try {
    await redisClient.ping();
    console.log('✅ Redis ready');
  } catch (err) {
    console.error('❌ Redis connection failed:', err);
    process.exit(1);
  }
};
