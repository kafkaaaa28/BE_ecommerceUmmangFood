import multer from 'multer';
import { AppError } from '../modules/error/AppError.js';

export const AVATAR_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const AVATAR_MAX_FILE_SIZE_MB = 2;
export const AVATAR_MAX_FILE_SIZE_BYTES = AVATAR_MAX_FILE_SIZE_MB * 1024 * 1024;
export const AVATAR_ALLOWED_FORMAT_LABEL = 'JPG, PNG, atau WEBP';

export const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: AVATAR_MAX_FILE_SIZE_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    if (!AVATAR_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(
        new AppError('INVALID_AVATAR_FORMAT', 400, `Foto profile harus berupa ${AVATAR_ALLOWED_FORMAT_LABEL} dengan ukuran maksimal ${AVATAR_MAX_FILE_SIZE_MB} MB`, {
          field: 'avatar',
          acceptedMimeTypes: AVATAR_ALLOWED_MIME_TYPES,
          maxFileSizeMB: AVATAR_MAX_FILE_SIZE_MB,
        }),
      );
    }

    cb(null, true);
  },
});
