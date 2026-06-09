import { z } from 'zod';

const slugSchema = z
  .string()
  .trim()
  .min(2, 'Slug minimal 2 karakter')
  .max(100, 'Slug maksimal 100 karakter')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug hanya boleh huruf kecil, angka, dan tanda hubung');

const statusSchema = z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']);
const mediaTypeSchema = z.enum(['IMAGE', 'VIDEO']);

const nullableTrimmedString = z.preprocess((value) => {
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  return value;
}, z.string().trim().min(1).nullable().optional());

const optionalNullableInt = z.number().int().nullable().optional();

const optionalBooleanFromUnknown = z.preprocess((value) => {
  if (value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return value;
}, z.boolean().optional());
export const searchCatalogQuerySchema = z.object({
  keyword: z.string().trim().min(3, 'Keyword minimal 3 karakter'),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2, 'Nama kategori minimal 2 karakter').max(100, 'Nama kategori maksimal 100 karakter'),
  slug: slugSchema,
});

export const categoryUpdateSchema = categoryCreateSchema.partial().refine((value) => Object.keys(value).length > 0, {
  message: 'Minimal satu field kategori harus diisi',
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2, 'Nama produk minimal 2 karakter').max(150, 'Nama produk maksimal 150 karakter'),
  slug: slugSchema,
  description: z.string().trim().max(5000, 'Deskripsi terlalu panjang').optional().nullable(),
  status: statusSchema.optional().default('DRAFT'),
  categoryId: nullableTrimmedString,
});

export const productUpdateSchema = z
  .object({
    name: z.string().trim().min(2, 'Nama produk minimal 2 karakter').max(150, 'Nama produk maksimal 150 karakter').optional(),
    slug: slugSchema.optional(),
    description: z.string().trim().max(5000, 'Deskripsi terlalu panjang').optional().nullable(),
    status: statusSchema.optional(),
    categoryId: nullableTrimmedString,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field produk harus diisi',
  });

export const productListQuerySchema = z.object({
  categoryId: z.string().trim().min(1).optional(),
  status: statusSchema.optional(),
});

export const cartItemCreateSchema = z.object({
  variantId: z.string().trim().min(1, 'Variant ID wajib diisi'),
  quantity: z.coerce.number().int().min(1, 'Quantity minimal 1').optional().default(1),
});

export const cartItemUpdateSchema = z.object({
  variantId: z.string().trim().min(1, 'Variant ID wajib diisi'),
  quantity: z.coerce.number().int().min(1, 'Quantity minimal 1'),
});
export const cartItemDeleteSchema = z.object({
  variantId: z.string().trim().min(1, 'Variant ID wajib diisi'),
});
export const variantCreateSchema = z.object({
  sku: z.string().trim().min(2, 'SKU minimal 2 karakter').max(100, 'SKU maksimal 100 karakter'),
  variantName: z.string().trim().min(2, 'Nama varian minimal 2 karakter').max(150, 'Nama varian maksimal 150 karakter'),
  price: z.coerce.number().positive('Harga harus lebih dari 0'),
  weightGram: optionalNullableInt.refine((value) => value === undefined || value === null || value > 0, 'Berat tidak boleh negatif atau nol'),
  isActive: z.boolean().optional().default(true),
  imageUrl: z.string().trim().url('URL gambar tidak valid').optional().nullable(),
  onHand: z.coerce.number().int().min(0, 'Stok awal tidak boleh negatif').optional().default(0),
  reserved: z.coerce.number().int().min(0, 'Reserved tidak boleh negatif').optional().default(0),
  reorderLevel: z.coerce.number().int().min(0, 'Reorder level tidak boleh negatif').optional().default(0),
});

export const variantUpdateSchema = z
  .object({
    sku: z.string().trim().min(2, 'SKU minimal 2 karakter').max(100, 'SKU maksimal 100 karakter').optional(),
    variantName: z.string().trim().min(2, 'Nama varian minimal 2 karakter').max(150, 'Nama varian maksimal 150 karakter').optional(),
    price: z.coerce.number().positive('Harga harus lebih dari 0').optional(),
    weightGram: optionalNullableInt.refine((value) => value === undefined || value === null || value > 0, 'Berat tidak boleh negatif'),
    isActive: z.boolean().optional(),
    imageUrl: z.string().trim().url('URL gambar tidak valid').optional().nullable(),
    reorderLevel: z.coerce.number().int().min(0, 'Reorder level tidak boleh negatif').optional().default(0),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field varian harus diisi',
  });

export const inventoryUpdateSchema = z
  .object({
    reorderLevel: z.coerce.number().int().min(0, 'Reorder level tidak boleh negatif').optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field inventory harus diisi',
  });

const movementTypeSchema = z.enum(['STOCK_IN', 'STOCK_OUT', 'ADJUSTMENT', 'RESERVE', 'RELEASE', 'DEDUCT']);

export const stockMovementCreateSchema = z.object({
  inventoryId: z.string().trim().min(1, 'Inventory wajib diisi'),
  type: movementTypeSchema,
  qty: z.coerce.number().int(),
  note: z.string().trim().max(500, 'Catatan terlalu panjang').optional().nullable(),
  refType: z.string().trim().max(100, 'Ref type terlalu panjang').optional().nullable(),
  refId: z.string().trim().max(100, 'Ref ID terlalu panjang').optional().nullable(),
});

export const stockMovementUpdateSchema = z
  .object({
    type: movementTypeSchema.optional(),
    qty: z.coerce.number().int().optional(),
    note: z.string().trim().max(500, 'Catatan terlalu panjang').optional().nullable(),
    refType: z.string().trim().max(100, 'Ref type terlalu panjang').optional().nullable(),
    refId: z.string().trim().max(100, 'Ref ID terlalu panjang').optional().nullable(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field stock movement harus diisi',
  });

export const stockMovementListQuerySchema = z.object({
  inventoryId: z.string().trim().min(1).optional(),
  type: movementTypeSchema.optional(),
});

export const productMediaCreateSchema = z.object({
  variantId: nullableTrimmedString,
  type: mediaTypeSchema.optional().default('IMAGE'),
  url: z.string().trim().url('URL media tidak valid'),
  alt: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }
    return value;
  }, z.string().trim().max(255, 'Alt terlalu panjang').optional().nullable()),
  sortOrder: z.coerce.number().int().min(0, 'Sort order tidak boleh negatif').optional().default(0),
  isPrimary: optionalBooleanFromUnknown.default(false),
});

export const productMediaUpdateSchema = z
  .object({
    variantId: nullableTrimmedString,
    type: mediaTypeSchema.optional(),
    url: z.string().trim().url('URL media tidak valid').optional(),
    alt: z.preprocess((value) => {
      if (typeof value === 'string' && value.trim() === '') {
        return null;
      }
      return value;
    }, z.string().trim().max(255, 'Alt terlalu panjang').optional().nullable()),
    sortOrder: z.coerce.number().int().min(0, 'Sort order tidak boleh negatif').optional(),
    isPrimary: optionalBooleanFromUnknown,
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Minimal satu field media harus diisi',
  });

export const productMediaUploadSchema = z.object({
  variantId: nullableTrimmedString,
  alt: z.preprocess((value) => {
    if (typeof value === 'string' && value.trim() === '') {
      return null;
    }
    return value;
  }, z.string().trim().max(255, 'Alt terlalu panjang').optional().nullable()),
  sortOrder: z.coerce.number().int().min(0, 'Sort order tidak boleh negatif').optional().default(0),
  isPrimary: optionalBooleanFromUnknown.default(false),
});
