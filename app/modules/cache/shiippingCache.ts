import { redisClient } from '../../config/redis.config.js';
export type ShippingCachePurpose = 'shippingCost';

const Key = (identifier: string, purpose: ShippingCachePurpose) => `shipping:${purpose}:${identifier}`;

export const setShippingCache = async (identifier: string, value: string, purpose: ShippingCachePurpose, ttlSeconds = 180) => {
  const key = Key(identifier, purpose);
  await redisClient.setex(key, ttlSeconds, value);
};
export const getShippingCache = async (identifier: string, purpose: ShippingCachePurpose) => {
  const key = Key(identifier, purpose);
  return await redisClient.get(key);
};
