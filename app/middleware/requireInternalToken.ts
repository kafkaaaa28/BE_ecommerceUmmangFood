import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AppError } from '../modules/error/AppError.js';
import { verifyAccessToken } from '../modules/lib/jwt/jwt.js';

export function requireAccessToken(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;
  if (!token) {
    next(new AppError('UNAUTHORIZED', StatusCodes.UNAUTHORIZED, 'Access token is required in the Authorization header as Bearer token '));
    return;
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload.type !== 'access') {
      next(new AppError('INVALID_TOKEN_TYPE', StatusCodes.UNAUTHORIZED, 'Expected access token'));
      return;
    }

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('TOKEN_EXPIRED', StatusCodes.UNAUTHORIZED, 'Access token expire'));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('INVALID_REFRESH_TOKEN', StatusCodes.UNAUTHORIZED, 'Invalid refresh token'));
      return;
    }

    next(error);
  }
}
