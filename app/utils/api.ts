import { AppError } from '../../app/modules/error/AppError.js';
export const getBinderbytesConfig = () => {
  const apiKey = process.env.BINDERBYTES_API_KEY;
  const baseUrl = process.env.BINDERBYTES_BASE_URL;
  if (!apiKey || !baseUrl) {
    throw new AppError('BINDERBYTES_CONFIG_INVALID', 500, 'Konfigurasi Binderbytes belum lengkap');
  }

  return {
    BINDERBYTES_BASE_URL: baseUrl,
    BINDERBYTES_API_KEY: apiKey,
  };
};
