import type { AuthService } from '../../auth/auth.services.js';
import type { UserRepository } from '../../user/user.repository.js';
import { AppError } from '../../error/AppError.js';
import type { ProductCategoryInput, ProductCategoryResponse, ProductCategoryUpdateInput } from '../product.types.js';
import { ensureCategoryExists, ensureSeller } from '../product.access.js';
import type { CategoryRepository } from './category.repository.js';

export class CategoryService {
  constructor(
    private readonly categoryRepo: CategoryRepository,
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
  ) {}

  async createCategory(userId: string, input: ProductCategoryInput): Promise<ProductCategoryResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);

    const existing = await this.categoryRepo.findCategoryBySlug(input.slug);
    if (existing) {
      throw new AppError('CATEGORY_ALREADY_EXISTS', 409, 'Kategori sudah ada');
    }

    return this.categoryRepo.createCategory(input);
  }

  async listCategories(userId: string): Promise<ProductCategoryResponse[]> {
    await ensureSeller(userId, this.authService, this.userRepo);
    return this.categoryRepo.listCategories();
  }

  async getCategoryById(userId: string, categoryId: string): Promise<ProductCategoryResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    return (await ensureCategoryExists(categoryId, this.categoryRepo))!;
  }

  async updateCategory(userId: string, categoryId: string, input: ProductCategoryUpdateInput): Promise<ProductCategoryResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureCategoryExists(categoryId, this.categoryRepo);

    if (input.slug) {
      const existing = await this.categoryRepo.findCategoryBySlug(input.slug);
      if (existing && existing.id !== categoryId) {
        throw new AppError('CATEGORY_ALREADY_EXISTS', 409, 'Kategori dengan slug tersebut sudah ada');
      }
    }

    return this.categoryRepo.updateCategory(categoryId, input);
  }

  async deleteCategory(userId: string, categoryId: string): Promise<ProductCategoryResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureCategoryExists(categoryId, this.categoryRepo);

    try {
      return await this.categoryRepo.deleteCategory(categoryId);
    } catch {
      throw new AppError('DELETE_CATEGORY_FAILED', 409, 'Kategori gagal dihapus. Pastikan tidak sedang dipakai produk');
    }
  }
}
