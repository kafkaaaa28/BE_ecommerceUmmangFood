import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import type { ProductCategoryInput, ProductCategoryResponse, ProductCategoryUpdateInput } from '../product.types.js';
import { categorySelect } from '../product.selects.js';

export class CategoryRepository {
  async createCategory(input: ProductCategoryInput): Promise<ProductCategoryResponse> {
    return prisma.category.create({
      data: {
        id: crypto.randomUUID(),
        name: input.name,
        slug: input.slug,
      },
      select: categorySelect,
    });
  }

  async listCategories(): Promise<ProductCategoryResponse[]> {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: categorySelect,
    });
  }

  async findCategoryById(id: string): Promise<ProductCategoryResponse | null> {
    return prisma.category.findUnique({
      where: { id },
      select: categorySelect,
    });
  }

  async findCategoryBySlug(slug: string): Promise<ProductCategoryResponse | null> {
    return prisma.category.findUnique({
      where: { slug },
      select: categorySelect,
    });
  }

  async updateCategory(categoryId: string, input: ProductCategoryUpdateInput): Promise<ProductCategoryResponse> {
    return prisma.category.update({
      where: { id: categoryId },
      data: input,
      select: categorySelect,
    });
  }

  async deleteCategory(categoryId: string): Promise<ProductCategoryResponse> {
    return prisma.category.delete({
      where: { id: categoryId },
      select: categorySelect,
    });
  }
}
