import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import multer from 'multer';
import { AppError } from './AppError.js';

const uploadFieldConfig: Record<string, { label: string; maxFileSizeMB: number; allowedFormats: string; expectedField: string }> = {
  avatar: {
    label: 'Foto profile',
    maxFileSizeMB: 2,
    allowedFormats: 'JPG, PNG, atau WEBP',
    expectedField: 'avatar',
  },
  file: {
    label: 'Media produk',
    maxFileSizeMB: 5,
    allowedFormats: 'JPG, PNG, atau WEBP',
    expectedField: 'file',
  },
};

const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      message: err.message,
      code: err.code,
      status: err.status,
      ...(err.meta ? { meta: err.meta } : {}),
    });
  }

  if (err instanceof multer.MulterError) {
    const uploadConfig = err.field ? uploadFieldConfig[err.field] : undefined;

    if (err.code === 'LIMIT_FILE_SIZE') {
      const label = uploadConfig?.label ?? 'File';
      const maxFileSizeMB = uploadConfig?.maxFileSizeMB ?? 2;
      const allowedFormats = uploadConfig?.allowedFormats ?? 'JPG, PNG, atau WEBP';

      return res.status(400).json({
        message: `${label} maksimal ${maxFileSizeMB} MB dan harus berupa ${allowedFormats}`,
        code: 'FILE_TOO_LARGE',
        status: 400,
        meta: {
          field: err.field ?? null,
          maxFileSizeMB,
          allowedFormats,
        },
      });
    }

    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      const label = uploadConfig?.label ?? 'File upload';
      const expectedField = uploadConfig?.expectedField ?? 'file';

      return res.status(400).json({
        message: `${label} harus dikirim melalui field \`${expectedField}\``,
        code: 'UNEXPECTED_FILE_FIELD',
        status: 400,
        meta: {
          field: err.field ?? null,
          expectedField,
        },
      });
    }

    return res.status(400).json({
      message: 'Upload file tidak valid',
      code: err.code,
      status: 400,
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
