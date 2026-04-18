import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from './AppError.js';

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
      status: err.status,
      ...(err.meta ? { meta: err.meta } : {}),
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
  });
};

export default globalErrorHandler;
