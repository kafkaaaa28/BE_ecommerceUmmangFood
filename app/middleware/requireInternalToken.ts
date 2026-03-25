import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { AppError } from '../modules/error/AppError.js';
import { verifyAccessToken } from '../modules/lib/jwt/jwt.js';

export function requireAccessToken(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    next(new AppError('Access token is required in the Authorization header as Bearer token', StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED'));
    return;
  }

  const payload = verifyAccessToken(token);
  if (payload.type !== 'access') {
    next(new AppError('Invalid token type', StatusCodes.UNAUTHORIZED, 'INVALID_TOKEN'));
    return;
  }
  req.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    sessionId: payload.sessionId,
  };
  next();
}
