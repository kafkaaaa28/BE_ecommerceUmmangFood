import { AppError } from '../error/AppError.js';
export const toBinderbyteDistrictId = (districtId?: string | null) => {
  const trimmed = districtId?.trim();
  if (!trimmed) {
    throw new AppError('ORIGIN_REQUIRED', 400, 'Origin wajib diisi');
  }
  if (trimmed.startsWith('dist_')) {
    return trimmed;
  }

  return `dist_${trimmed}`;
};
