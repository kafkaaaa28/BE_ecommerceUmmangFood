import type { Prisma } from '../../../generated/prisma/client.js';

export const categorySelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CategorySelect;

export const inventorySelect = {
  id: true,
  variantId: true,
  onHand: true,
  reserved: true,
  reorderLevel: true,
  updatedAt: true,
} satisfies Prisma.InventorySelect;

export const productMediaSelect = {
  id: true,
  productId: true,
  variantId: true,
  type: true,
  url: true,
  alt: true,
  sortOrder: true,
  isPrimary: true,
  createdAt: true,
} satisfies Prisma.ProductMediaSelect;

export const productMediaOrderBy: Prisma.ProductMediaOrderByWithRelationInput[] = [{ sortOrder: 'asc' }, { createdAt: 'asc' }];

export const variantSelect = {
  id: true,
  productId: true,
  sku: true,
  variantName: true,
  price: true,
  weightGram: true,
  isActive: true,
  imageUrl: true,
  productMedias: {
    select: productMediaSelect,
    orderBy: productMediaOrderBy,
  },
  inventory: { select: inventorySelect },
} satisfies Prisma.ProductVariantSelect;

export const productSelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  status: true,
  categoryId: true,
  category: { select: categorySelect },
  productMedias: {
    select: productMediaSelect,
    orderBy: productMediaOrderBy,
  },
  variants: { select: variantSelect },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export const stockMovementSelect = {
  id: true,
  inventoryId: true,
  type: true,
  qty: true,
  note: true,
  refType: true,
  refId: true,
  actorId: true,
  createdAt: true,
  actor: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  },
} satisfies Prisma.StockMovementSelect;
