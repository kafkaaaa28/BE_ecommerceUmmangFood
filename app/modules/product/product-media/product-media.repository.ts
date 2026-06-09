import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import type { ProductMediaInput, ProductMediaResponse, ProductMediaUpdateInput } from '../product.types.js';
import { productMediaSelect } from '../product.selects.js';

export class ProductMediaRepository {
  async createProductMedia(productId: string, input: ProductMediaInput): Promise<ProductMediaResponse> {
    return prisma.$transaction(async (tx) => {
      if (input.isPrimary) {
        await tx.productMedia.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      }

      return tx.productMedia.create({
        data: {
          id: crypto.randomUUID(),
          productId,
          variantId: input.variantId ?? null,
          type: input.type ?? 'IMAGE',
          url: input.url,
          alt: input.alt ?? null,
          sortOrder: input.sortOrder ?? 0,
          isPrimary: input.isPrimary ?? false,
        },
        select: productMediaSelect,
      });
    });
  }

  async listProductMediaByProductId(productId: string): Promise<ProductMediaResponse[]> {
    return prisma.productMedia.findMany({
      where: { productId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
      select: productMediaSelect,
    });
  }

  async findProductMediaById(mediaId: string): Promise<ProductMediaResponse | null> {
    return prisma.productMedia.findUnique({
      where: { id: mediaId },
      select: productMediaSelect,
    });
  }

  async updateProductMedia(mediaId: string, input: ProductMediaUpdateInput): Promise<ProductMediaResponse> {
    return prisma.$transaction(async (tx) => {
      const currentMedia = await tx.productMedia.findUnique({
        where: { id: mediaId },
        select: { productId: true },
      });

      if (!currentMedia) {
        throw new Error('PRODUCT_MEDIA_NOT_FOUND');
      }

      if (input.isPrimary === true) {
        await tx.productMedia.updateMany({
          where: {
            productId: currentMedia.productId,
            isPrimary: true,
            id: { not: mediaId },
          },
          data: { isPrimary: false },
        });
      }

      return tx.productMedia.update({
        where: { id: mediaId },
        data: {
          ...(input.variantId !== undefined ? { variantId: input.variantId ?? null } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.url !== undefined ? { url: input.url } : {}),
          ...(input.alt !== undefined ? { alt: input.alt ?? null } : {}),
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
          ...(input.isPrimary !== undefined ? { isPrimary: input.isPrimary } : {}),
        },
        select: productMediaSelect,
      });
    });
  }

  async deleteProductMedia(mediaId: string): Promise<ProductMediaResponse> {
    return prisma.productMedia.delete({
      where: { id: mediaId },
      select: productMediaSelect,
    });
  }
}
