import { z } from 'zod';

export const createOrderItemSchema = z.object({
  variantId: z.string({ message: 'variantId wajib diisi' }).min(1),
  quantity: z.number({ message: 'quantity wajib diisi' }).int().min(1),
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, 'Minimal 1 item'),
  addressId: z.string({ message: 'addressId wajib diisi' }).min(1),
  courierCode: z.string({ message: 'courierCode wajib diisi' }).min(1),
  serviceCode: z.string({ message: 'serviceCode wajib diisi' }).min(1),
  serviceName: z.string({ message: 'serviceName wajib diisi' }).min(1),
  shippingFee: z.number({ message: 'shippingFee wajib diisi' }).min(0),
  shippingEtd: z.string().optional().default(''),
  notes: z.string().optional(),
});

export const orderListQuerySchema = z.object({
  status: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED']),
});
