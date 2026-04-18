import { email, z } from 'zod';
import { EmailInputSchema, OtpInputSchema } from '../auth/auth.schema.js';
import { searchSorted } from '@tensorflow/tfjs-node';
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
    name: z.preprocess((v) => (typeof v === 'string' ? v.normalize('NFKC').trim() : v), z.string().min(1, 'NAME_EMPTY').max(100, 'NAME_TOO_LONG')),
  })
  .refine((v) => v.name !== undefined, {
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

export const createAddressSchema = z.object({
  searchSorted: z.string().trim().max(255, 'Pencarian alamat maksimal 255 karakter').optional().or(z.literal('')),
  label: z.string().trim().min(1, 'Label alamat wajib diisi').max(50, 'Label alamat maksimal 50 karakter'),

  recipientName: z.string().trim().min(1, 'Nama penerima wajib diisi').max(100, 'Nama penerima maksimal 100 karakter'),

  phone: z
    .string()
    .trim()
    .min(8, 'Nomor HP minimal 8 digit')
    .max(20, 'Nomor HP maksimal 20 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Format nomor HP tidak valid'),

  provinceId: z.number({ error: 'Provinsi wajib dipilih' }).int('Provinsi tidak valid').positive('Provinsi wajib dipilih'),

  cityId: z.number({ error: 'Kota wajib dipilih' }).int('Kota tidak valid').positive('Kota wajib dipilih'),

  jalan: z.string().trim().min(1, 'Alamat jalan wajib diisi').max(255, 'Alamat jalan maksimal 255 karakter'),

  detail: z.string().trim().max(255, 'Detail alamat maksimal 255 karakter').optional().or(z.literal('')),
});

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
