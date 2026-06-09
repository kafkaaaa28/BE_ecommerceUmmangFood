import { AppError } from '../error/AppError.js';
import type { AuthService } from '../auth/auth.services.js';
import type { UserRepository } from '../user/user.repository.js';
import type { ProductVariantInput, ProductCategoryResponse, ProductResponse, ProductVariantResponse, InventoryResponse, StockMovementResponse, ProductMediaResponse } from './product.types.js';
import type { CategoryRepository } from './category/category.repository.js';
import type { ProductRepository } from './product/product.repository.js';
import type { VariantRepository } from './variant/variant.repository.js';
import type { InventoryRepository } from './inventory/inventory.repository.js';
import type { StockMovementRepository } from './stock-movement/stock-movement.repository.js';
import type { ProductMediaRepository } from './product-media/product-media.repository.js';

export async function ensureSeller(userId: string, authService: AuthService, userRepo: UserRepository) {
  const user = await userRepo.findById(userId);
  const safeUser = await authService.ensureActiveUser(user);

  if (safeUser.role !== 'SELLER') {
    throw new AppError('FORBIDDEN', 403, 'Akses ditolak');
  }

  return safeUser;
}

export async function ensureCategoryExists(categoryId: string | null | undefined, categoryRepo: CategoryRepository): Promise<ProductCategoryResponse | null> {
  if (!categoryId) return null;

  const category = await categoryRepo.findCategoryById(categoryId);
  if (!category) {
    throw new AppError('CATEGORY_NOT_FOUND', 404, 'Kategori tidak ditemukan');
  }

  return category;
}

export async function ensureProductExists(productId: string, productRepo: ProductRepository): Promise<ProductResponse> {
  const product = await productRepo.findProductById(productId);
  if (!product) {
    throw new AppError('PRODUCT_NOT_FOUND', 404, 'Produk tidak ditemukan');
  }

  return product;
}

export async function ensureVariantExists(variantId: string, variantRepo: VariantRepository): Promise<ProductVariantResponse> {
  const variant = await variantRepo.findVariantById(variantId);
  if (!variant) {
    throw new AppError('VARIANT_NOT_FOUND', 404, 'Varian tidak ditemukan');
  }

  return variant;
}
export async function ensureVariantExistsByProductId(productId: string, variantRepo: VariantRepository): Promise<ProductVariantResponse[]> {
  const variants = await variantRepo.listVariantsByProductId(productId);
  if (!variants || variants.length === 0) {
    throw new AppError('VARIANTS_NOT_FOUND', 404, 'pastikan produk memiliki variant');
  }

  return variants;
}
export async function ensureInventoryExistsById(inventoryId: string, inventoryRepo: InventoryRepository): Promise<InventoryResponse> {
  const inventory = await inventoryRepo.findInventoryById(inventoryId);
  if (!inventory) {
    throw new AppError('INVENTORY_NOT_FOUND', 404, 'Inventory tidak ditemukan');
  }

  return inventory;
}

export async function ensureStockMovementExists(movementId: string, stockMovementRepo: StockMovementRepository): Promise<StockMovementResponse> {
  const movement = await stockMovementRepo.findStockMovementById(movementId);
  if (!movement) {
    throw new AppError('STOCK_MOVEMENT_NOT_FOUND', 404, 'Stock movement tidak ditemukan');
  }

  return movement;
}

export async function ensureProductMediaExists(mediaId: string, productMediaRepo: ProductMediaRepository): Promise<ProductMediaResponse> {
  const media = await productMediaRepo.findProductMediaById(mediaId);
  if (!media) {
    throw new AppError('PRODUCT_MEDIA_NOT_FOUND', 404, 'Media produk tidak ditemukan');
  }

  return media;
}

export async function ensureVariantBelongsToProduct(productId: string, variantId: string | null | undefined, variantRepo: VariantRepository): Promise<ProductVariantResponse | null> {
  if (!variantId) return null;

  const variant = await ensureVariantExists(variantId, variantRepo);
  if (variant.productId !== productId) {
    throw new AppError('VARIANT_PRODUCT_MISMATCH', 400, 'Varian tidak termasuk ke produk ini');
  }

  return variant;
}

export function validateInitialInventory(input: ProductVariantInput) {
  const onHand = input.onHand ?? 0;
  const reserved = input.reserved ?? 0;

  if (reserved > onHand) {
    throw new AppError('INVALID_INVENTORY_STATE', 400, 'Reserved stock tidak boleh melebihi on hand');
  }
}
