import type { AuthService } from '../../auth/auth.services.js';
import type { UserRepository } from '../../user/user.repository.js';
import { AppError } from '../../error/AppError.js';
import type { ProductInput, ProductListQuery, ProductResponse, ProductUpdateInput } from '../product.types.js';
import { ensureCategoryExists, ensureProductExists, ensureSeller, ensureVariantExistsByProductId } from '../product.access.js';
import type { CategoryRepository } from '../category/category.repository.js';
import type { ProductRepository } from './product.repository.js';
import type { VariantRepository } from '../variant/variant.repository.js';

export class ProductService {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
    private readonly variantRepo: VariantRepository,
  ) {}

  async createProduct(userId: string, input: ProductInput): Promise<ProductResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureCategoryExists(input.categoryId, this.categoryRepo);

    const existing = await this.productRepo.findProductBySlug(input.slug);
    if (existing) {
      throw new AppError('PRODUCT_ALREADY_EXISTS', 409, 'Produk dengan slug tersebut sudah ada');
    }

    return this.productRepo.createProduct(input);
  }

  async listProducts(userId: string, query: ProductListQuery): Promise<ProductResponse[]> {
    await ensureSeller(userId, this.authService, this.userRepo);

    if (query.categoryId) {
      await ensureCategoryExists(query.categoryId, this.categoryRepo);
    }

    return this.productRepo.listProducts(query);
  }
  async publicListProducts(query: ProductListQuery): Promise<ProductResponse[]> {
    if (query.categoryId) {
      await ensureCategoryExists(query.categoryId, this.categoryRepo);
    }

    return this.productRepo.PublicListProducts(query);
  }
  async getProductById(userId: string, productId: string): Promise<ProductResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    return ensureProductExists(productId, this.productRepo);
  }

  async updateProduct(userId: string, productId: string, input: ProductUpdateInput): Promise<ProductResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);
    await ensureCategoryExists(input.categoryId, this.categoryRepo);
    if (input.status === 'ACTIVE') await ensureVariantExistsByProductId(productId, this.variantRepo);
    if (input.slug) {
      const existing = await this.productRepo.findProductBySlug(input.slug);
      if (existing && existing.id !== productId) {
        throw new AppError('PRODUCT_ALREADY_EXISTS', 409, 'Produk dengan slug tersebut sudah ada');
      }
    }

    return this.productRepo.updateProduct(productId, input);
  }

  async deleteProduct(userId: string, productId: string): Promise<ProductResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);

    try {
      return await this.productRepo.deleteProduct(productId);
    } catch {
      throw new AppError('DELETE_PRODUCT_FAILED', 409, 'Produk gagal dihapus. Pastikan tidak punya relasi transaksi aktif');
    }
  }
}
