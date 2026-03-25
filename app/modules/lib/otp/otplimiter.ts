import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redisClient } from '../../../config/redis.config.js';

export const rlRequestOtpByIp = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:reqotp:ip',
  points: 100,
  duration: 10 * 60,
  blockDuration: 10 * 60,
});

export const rlRequestOtpByEmail = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:reqotp:email',
  points: 10,
  duration: 60,
  blockDuration: 0,
});

export const rlVerifyOtpByIp = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:verotp:ip',
  points: 30,
  duration: 10 * 60,
});

export const rlVerifyOtpByEmail = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'rl:verotp:email',
  points: 10,
  duration: 10 * 60,
  blockDuration: 10 * 60,
});
