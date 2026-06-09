import multer from 'multer';
import { AppError } from '../modules/error/AppError.js';

export const PRODUCT_MEDIA_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const PRODUCT_MEDIA_MAX_FILE_SIZE_MB = 5;
export const PRODUCT_MEDIA_MAX_FILE_SIZE_BYTES = PRODUCT_MEDIA_MAX_FILE_SIZE_MB * 1024 * 1024;
export const PRODUCT_MEDIA_ALLOWED_FORMAT_LABEL = 'JPG, PNG, atau WEBP';

export const productMediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: PRODUCT_MEDIA_MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!PRODUCT_MEDIA_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new AppError(
          'INVALID_PRODUCT_MEDIA_FORMAT',
          400,
          `Media produk harus berupa ${PRODUCT_MEDIA_ALLOWED_FORMAT_LABEL} dengan ukuran maksimal ${PRODUCT_MEDIA_MAX_FILE_SIZE_MB} MB`,
          {
            field: 'file',
            acceptedMimeTypes: PRODUCT_MEDIA_ALLOWED_MIME_TYPES,
            maxFileSizeMB: PRODUCT_MEDIA_MAX_FILE_SIZE_MB,
          },
        ),
      );
    }

    cb(null, true);
  },
});
