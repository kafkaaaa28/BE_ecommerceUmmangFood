import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import type { ProductVariantInput, ProductVariantResponse, ProductVariantUpdateInput } from '../product.types.js';
import { variantSelect } from '../product.selects.js';

export class VariantRepository {
  async createVariant(productId: string, input: ProductVariantInput): Promise<ProductVariantResponse> {
    return prisma.productVariant.create({
      data: {
        id: crypto.randomUUID(),
        productId,
        sku: input.sku,
        variantName: input.variantName,
        price: input.price,
        weightGram: input.weightGram ?? null,
        isActive: input.isActive ?? true,
        imageUrl: input.imageUrl ?? null,
        inventory: {
          create: {
            id: crypto.randomUUID(),
            onHand: 0,
            reserved: 0,
            reorderLevel: input.reorderLevel ?? 0,
          },
        },
      },
      select: variantSelect,
    });
  }

  async listVariantsByProductId(productId: string): Promise<ProductVariantResponse[]> {
    return prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
      select: variantSelect,
    });
  }

  async findVariantById(variantId: string): Promise<ProductVariantResponse | null> {
    return prisma.productVariant.findUnique({
      where: { id: variantId },
      select: variantSelect,
    });
  }

  async findVariantBySku(sku: string): Promise<ProductVariantResponse | null> {
    return prisma.productVariant.findUnique({
      where: { sku },
      select: variantSelect,
    });
  }

  async updateVariant(variantId: string, input: ProductVariantUpdateInput): Promise<ProductVariantResponse> {
    return prisma.productVariant.update({
      where: { id: variantId },
      data: {
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.variantName !== undefined ? { variantName: input.variantName } : {}),
        ...(input.price !== undefined ? { price: input.price } : {}),
        ...(input.weightGram !== undefined ? { weightGram: input.weightGram ?? null } : {}),
        ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        ...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl ?? null } : {}),
      },
      select: variantSelect,
    });
  }

  async deleteVariant(variantId: string): Promise<ProductVariantResponse> {
    return prisma.productVariant.delete({
      where: { id: variantId },
      select: variantSelect,
    });
  }
}
