import { redisClient } from '../../config/redis.config.js';
export type AddressCachePurpose = 'searchSubdistricts';

const Key = (identifier: string, purpose: AddressCachePurpose) => `address:${purpose}:${identifier}`;

export const setAddressCache = async (identifier: string, value: string, purpose: AddressCachePurpose, ttlSeconds = 180) => {
  const key = Key(identifier, purpose);
  await redisClient.setex(key, ttlSeconds, value);
};
export const getAddressCache = async (identifier: string, purpose: AddressCachePurpose) => {
  const key = Key(identifier, purpose);
  return await redisClient.get(key);
};
