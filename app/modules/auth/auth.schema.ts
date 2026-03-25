import { z } from 'zod';

export const EmailInputSchema = z.preprocess(
  (v) => (typeof v === 'string' ? v.normalize('NFKC').trim() : v),
  z
    .email('EMAIL_INVALID')
    .min(1, 'EMAIL_EMPTY')
    .max(254, 'EMAIL_TOO_LONG')
    .refine((s) => !/[\u0000-\u001F\u007F]/.test(s), 'EMAIL_HAS_CONTROL_CHARS')
    .refine((s) => !/\s/.test(s), 'EMAIL_HAS_WHITESPACE')
    .transform((s) => s.toLowerCase()),
);

export const OtpInputSchema = z
  .string()
  .trim()
  .min(1, { message: 'OTP_REQUIRED' })
  .regex(/^\d{6}$/, { message: 'OTP_INVALID' });

export const RequestOtpSchema = z.object({
  email: EmailInputSchema,
});

export const VerifyOtpSchema = z.object({
  email: EmailInputSchema,
  otp: OtpInputSchema,
});

export const RefreshBodySchema = z
  .object({
    refreshToken: z.string().min(20),
  })
  .strict();
