import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { AppError } from '../modules/error/AppError.js';
import { verifyAccessToken } from '../modules/lib/jwt/jwt.js';
import { env } from '../config/env.js';

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

function createRoleMiddleware(allowedRoles: string[], code: string, message: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('UNAUTHORIZED', StatusCodes.UNAUTHORIZED, 'Access token is required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(code, StatusCodes.FORBIDDEN, message));
      return;
    }

    next();
  };
}

export const requireSeller = createRoleMiddleware(['SELLER'], 'SELLER_ONLY', 'Seller access required');
export const requireAdmin = createRoleMiddleware(['ADMIN'], 'ADMIN_ONLY', 'Admin access required');

export const requireSellerOrAdmin = createRoleMiddleware(['SELLER', 'ADMIN'], 'SELLER_OR_ADMIN_ONLY', 'Seller or admin access required');

export function requireInternalToken(req: Request, _res: Response, next: NextFunction): void {
  const internalToken = req.header('x-internal-token');

  if (!internalToken) {
    next(new AppError('UNAUTHORIZED_INTERNAL', StatusCodes.UNAUTHORIZED, 'Internal token is required'));
    return;
  }

  if (internalToken !== env.AUTH_INTERNAL_TOKEN) {
    next(new AppError('INVALID_INTERNAL_TOKEN', StatusCodes.UNAUTHORIZED, 'Invalid internal token'));
    return;
  }

  next();
}
