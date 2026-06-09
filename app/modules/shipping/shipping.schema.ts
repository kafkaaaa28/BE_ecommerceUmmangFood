import { z } from 'zod';

export const getShippingCostSchema = z.object({
  origin: z.string().trim().min(1, 'origin wajib dikirim'),

  destination: z.string().trim().min(1, 'Destination wajib dikirim'),

  weight: z.coerce
    .number({
      error: 'weight harus berupa angka',
    })
    .positive('berat harus lebih dari 0')
    .transform((value) => value.toString()),

  courier: z.string().trim().min(1, 'Courier wajib dikirim'),
});
