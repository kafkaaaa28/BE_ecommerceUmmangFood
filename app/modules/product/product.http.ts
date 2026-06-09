import type { Request } from 'express';
import { AppError } from '../error/AppError.js';

export function getUserId(req: Request) {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError('UNAUTHORIZED', 401, 'Unauthorized');
  }
  return userId;
}

export function getBody<T = unknown>(req: Request): T {
  return (req.body?.data ?? req.body) as T;
}
