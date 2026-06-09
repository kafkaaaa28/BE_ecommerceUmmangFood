import { z } from 'zod';

export const searchSubdistrictSchema = z.object({
  keyword: z.string().min(3, 'Minimal 3 karakter').max(50, 'Maksimal 50 karakter').trim(),

  limit: z
    .preprocess((val) => Number(val), z.number().int().min(1).max(50))
    .optional()
    .default(20),
});

export const createAddressSchema = z.object({
  provinsi: z.string().min(1, 'Provinsi wajib diisi').trim(),

  kota: z.string().min(1, 'Kota wajib diisi').trim(),

  kecamatan: z.string().min(1, 'Kecamatan wajib diisi').trim(),

  kelurahan: z.string().min(1, 'Kelurahan wajib diisi').trim(),

  kodePos: z
    .string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit angka')
    .nullable(),

  districtId: z.string().nullable(),

  subdistrictId: z.string().nullable(),

  label: z.string().min(1, 'Label alamat wajib diisi').trim(),

  recipientName: z.string().min(1, 'Nama penerima wajib diisi').trim(),

  phone: z
    .string()
    .min(9, 'Nomor telepon terlalu pendek')
    .max(15, 'Nomor telepon terlalu panjang')
    .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh angka dan +')
    .transform((val) => val.replace(/\s+/g, '')),

  provinceId: z.string().nullable(),

  cityId: z.string().nullable(),

  jalan: z.string().min(1, 'Alamat jalan wajib diisi').trim(),

  detail: z.string().trim().nullable(),
});

export const updateAddressSchema = z.object({
  provinsi: z.string().min(1, 'Provinsi wajib diisi').trim().optional(),
  kota: z.string().min(1, 'Kota wajib diisi').trim().optional(),
  kecamatan: z.string().min(1, 'Kecamatan wajib diisi').trim().optional(),
  kelurahan: z.string().min(1, 'Kelurahan wajib diisi').trim().optional(),
  kodePos: z
    .string()
    .regex(/^\d{5}$/, 'Kode pos harus 5 digit angka')
    .nullable()
    .optional(),
  districtId: z.string().nullable().optional(),
  subdistrictId: z.string().nullable().optional(),
  label: z.string().min(1, 'Label alamat wajib diisi').trim().optional(),
  recipientName: z.string().min(1, 'Nama penerima wajib diisi').trim().optional(),
  phone: z
    .string()
    .min(9, 'Nomor telepon terlalu pendek')
    .max(15, 'Nomor telepon terlalu panjang')
    .regex(/^[0-9+]+$/, 'Nomor telepon hanya boleh angka dan +')
    .transform((val) => val.replace(/\s+/g, ''))
    .optional(),
  provinceId: z.string().nullable().optional(),
  cityId: z.string().nullable().optional(),
  jalan: z.string().min(1, 'Alamat jalan wajib diisi').trim().optional(),
  detail: z.string().trim().nullable().optional(),
});
export const createAddressSellerSchema = z.object({
  districtId: z.string().min(1, 'District ID wajib diisi').trim().nullable(),
  label: z.string().min(1, 'Label alamat wajib diisi').trim(),
  storeName: z.string().min(1, 'Nama toko wajib diisi').trim(),
});
export type CreateAddressSellerInput = z.infer<typeof createAddressSellerSchema>;
