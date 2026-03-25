import { email, z } from 'zod';
import { EmailInputSchema, OtpInputSchema } from '../auth/auth.schema.js';
const normalizePhone = (value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, '');

  if (normalized.startsWith('+62')) {
    return normalized.slice(1);
  }

  if (normalized.startsWith('62')) {
    return normalized;
  }

  if (normalized.startsWith('08')) {
    return `62${normalized.slice(1)}`;
  }

  if (normalized.startsWith('8')) {
    return `62${normalized}`;
  }

  return normalized;
};

export const phoneSchema = z.preprocess(
  normalizePhone,
  z
    .string()
    .min(10, 'PHONE_INVALID')
    .max(20, 'PHONE_INVALID')
    .regex(/^628[1-9][0-9]{6,11}$/, 'PHONE_INVALID'),
);

export const UpdateProfileSchema = z
  .object({
    name: z.preprocess((v) => (typeof v === 'string' ? v.normalize('NFKC').trim() : v), z.string().min(1, 'NAME_EMPTY').max(100, 'NAME_TOO_LONG')).optional(),
    phone: phoneSchema.optional(),
    image: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.string().url('IMAGE_URL_INVALID').max(2048, 'IMAGE_URL_TOO_LONG')).optional(),
  })
  .refine((v) => v.name !== undefined || v.phone !== undefined || v.image !== undefined, {
    message: 'PROFILE_UPDATE_EMPTY',
  });

export const phoneInput = z.object({
  phone: phoneSchema,
});

export const verifyPhoneOtpInput = z.object({
  phone: phoneSchema,
  email: EmailInputSchema,
  otp: OtpInputSchema,
});
