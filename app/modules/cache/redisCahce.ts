import { redisClient } from '../../config/redis.config.js';

export type OtpPurpose = 'login' | 'phone_verification';
export type OtpConsumeResult = 'MATCH' | 'MISMATCH' | 'NOT_FOUND';

const otpKey = (identifier: string, purpose: OtpPurpose) => `otp:${purpose}:${identifier}`;
const otpAttemptsKey = (identifier: string, purpose: OtpPurpose) => `otp:attempts:${purpose}:${identifier}`;

const consumeOtpLua = `
local otp = redis.call('GET', KEYS[1])
if not otp then
  return 0
end

if otp == ARGV[1] then
  redis.call('DEL', KEYS[1])
  redis.call('DEL', KEYS[2])
  return 1
end

return 2
`;

export const setOtp = async (identifier: string, otp: string, purpose: OtpPurpose, ttlSeconds = 300) => {
  const key = otpKey(identifier, purpose);
  await redisClient.setex(key, ttlSeconds, otp);
};

export const getOtp = async (identifier: string, purpose: OtpPurpose) => {
  const key = otpKey(identifier, purpose);
  return await redisClient.get(key);
};

export const delOtp = async (identifier: string, purpose: OtpPurpose) => {
  const key = otpKey(identifier, purpose);
  await redisClient.del(key);
};

export const consumeOtpIfMatch = async (identifier: string, purpose: OtpPurpose, candidateHash: string): Promise<OtpConsumeResult> => {
  const result = (await redisClient.eval(consumeOtpLua, 2, otpKey(identifier, purpose), otpAttemptsKey(identifier, purpose), candidateHash)) as number;

  if (result === 1) return 'MATCH';
  if (result === 2) return 'MISMATCH';
  return 'NOT_FOUND';
};

export const incrementOtpAttempts = async (identifier: string, purpose: OtpPurpose, ttlSeconds = 300) => {
  const key = otpAttemptsKey(identifier, purpose);
  const attempts = await redisClient.incr(key);
  if (attempts === 1) {
    await redisClient.expire(key, ttlSeconds);
  }
  return attempts;
};

export const resetOtpAttempts = async (identifier: string, purpose: OtpPurpose) => {
  const key = otpAttemptsKey(identifier, purpose);
  await redisClient.del(key);
};

export const clearOtpState = async (identifier: string, purpose: OtpPurpose) => {
  await Promise.all([delOtp(identifier, purpose), resetOtpAttempts(identifier, purpose)]);
};
