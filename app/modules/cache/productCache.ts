import { redisClient } from '../../config/redis.config.js';
export type ProductCachePurpose = 'searchProducts' | 'getProductById';

const Key = (identifier: string, purpose: ProductCachePurpose) => `product:${purpose}:${identifier}`;

export const setProductCache = async (identifier: string, value: string, purpose: ProductCachePurpose, ttlSeconds = 180) => {
  const key = Key(identifier, purpose);
  await redisClient.setex(key, ttlSeconds, value);
};
export const getProductCache = async (identifier: string, purpose: ProductCachePurpose) => {
  const key = Key(identifier, purpose);
  return await redisClient.get(key);
};
