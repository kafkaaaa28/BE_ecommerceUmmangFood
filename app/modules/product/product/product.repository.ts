import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import type { ProductInput, ProductListQuery, ProductResponse, ProductUpdateInput } from '../product.types.js';
import { productSelect } from '../product.selects.js';

export class ProductRepository {
  async searchCatalog(search: string, limit = 5) {
    const keyword = search.trim().normalize('NFKC');

    if (!keyword) {
      return {
        products: [],
        categories: [],
      };
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          name: {
            contains: keyword,
          },
        },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          productMedias: {
            take: 1,
            select: {
              url: true,
            },
          },
        },
      }),
      prisma.category.findMany({
        where: {
          name: {
            contains: keyword,
          },
        },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
        },
      }),
    ]);

    return {
      products,
      categories,
    };
  }

  async createProduct(input: ProductInput): Promise<ProductResponse> {
    return prisma.product.create({
      data: {
        id: crypto.randomUUID(),
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        status: input.status ?? 'DRAFT',
        categoryId: input.categoryId ?? null,
      },
      select: productSelect,
    });
  }

  async listProducts(query: ProductListQuery): Promise<ProductResponse[]> {
    return prisma.product.findMany({
      where: {
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    });
  }
  async PublicListProducts(query: ProductListQuery): Promise<ProductResponse[]> {
    return prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(query.categoryId ? { categoryId: query.categoryId } : {}),
        variants: {
          some: { isActive: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    });
  }
  async findProductById(productId: string): Promise<ProductResponse | null> {
    return prisma.product.findUnique({
      where: { id: productId },
      select: productSelect,
    });
  }

  async findProductBySlug(slug: string): Promise<ProductResponse | null> {
    return prisma.product.findUnique({
      where: { slug },
      select: productSelect,
    });
  }

  async updateProduct(productId: string, input: ProductUpdateInput): Promise<ProductResponse> {
    return prisma.product.update({
      where: { id: productId },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.slug !== undefined ? { slug: input.slug } : {}),
        ...(input.description !== undefined ? { description: input.description ?? null } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId ?? null } : {}),
      },
      select: productSelect,
    });
  }

  async deleteProduct(productId: string): Promise<ProductResponse> {
    return prisma.product.delete({
      where: { id: productId },
      select: productSelect,
    });
  }
}
