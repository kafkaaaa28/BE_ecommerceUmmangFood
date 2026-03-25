import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export function requestId(req: Request, res: Response, next: NextFunction): void {
  const incomingId = req.header('x-request-id');

  if (!req.user) {
    req.user = {} as Express.UserPayload;
  }

  req.user.id = incomingId ?? randomUUID();

  res.setHeader('x-request-id', req.user.id);
  next();
}
