import { z } from 'zod';

export const CreatePaymentDto = z.object({
  orderId: z.string({ error: 'orderId wajib diisi' }).min(1, 'orderId tidak boleh kosong'),
});

export const CheckStatusDto = z.object({
  orderId: z.string({ error: 'orderId wajib diisi' }).min(1),
});

export const CancelPaymentDto = z.object({
  orderId: z.string({ error: 'orderId wajib diisi' }).min(1),
});
export type CreatePaymentInput = z.infer<typeof CreatePaymentDto>;
export type CheckStatusInput = z.infer<typeof CheckStatusDto>;
export type CancelPaymentInput = z.infer<typeof CancelPaymentDto>;
