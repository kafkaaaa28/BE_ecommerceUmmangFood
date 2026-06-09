import type { AuthService } from '../../auth/auth.services.js';
import type { UserRepository } from '../../user/user.repository.js';
import { AppError } from '../../error/AppError.js';
import type { ProductVariantInput, ProductVariantResponse, ProductVariantUpdateInput } from '../product.types.js';
import { ensureProductExists, ensureSeller, ensureVariantExists, validateInitialInventory } from '../product.access.js';
import type { InventoryRepository } from '../inventory/inventory.repository.js';
import type { ProductRepository } from '../product/product.repository.js';
import type { StockMovementService } from '../stock-movement/stock-movement.service.js';
import type { VariantRepository } from './variant.repository.js';

export class VariantService {
  constructor(
    private readonly variantRepo: VariantRepository,
    private readonly productRepo: ProductRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly stockMovementService: StockMovementService,
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
  ) {}

  async createVariant(userId: string, productId: string, input: ProductVariantInput): Promise<ProductVariantResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);
    validateInitialInventory(input);

    const existing = await this.variantRepo.findVariantBySku(input.sku);
    if (existing) {
      throw new AppError('VARIANT_ALREADY_EXISTS', 409, 'Varian dengan SKU tersebut sudah ada');
    }

    const createdVariant = await this.variantRepo.createVariant(productId, input);
    if (!createdVariant.inventory) {
      throw new AppError('INVENTORY_CREATION_FAILED', 500, 'Gagal membuat inventory untuk varian');
    }

    if ((input.onHand ?? 0) > 0) {
      await this.stockMovementService.createStockMovement(userId, {
        inventoryId: createdVariant.inventory.id,
        type: 'STOCK_IN',
        qty: input.onHand ?? 0,
        note: 'Stok awal dari pembuatan varian',
        refId: createdVariant.id,
        refType: 'VARIANT',
      });
    }

    if ((input.reserved ?? 0) > 0) {
      await this.stockMovementService.createStockMovement(userId, {
        inventoryId: createdVariant.inventory.id,
        type: 'RESERVE',
        qty: input.reserved ?? 0,
        note: 'Stok yang di proses dari pembuatan varian',
        refId: createdVariant.id,
        refType: 'VARIANT',
      });
    }

    return ensureVariantExists(createdVariant.id, this.variantRepo);
  }

  async listVariantsByProductId(userId: string, productId: string): Promise<ProductVariantResponse[]> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureProductExists(productId, this.productRepo);
    return this.variantRepo.listVariantsByProductId(productId);
  }

  async getVariantById(userId: string, variantId: string): Promise<ProductVariantResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    return ensureVariantExists(variantId, this.variantRepo);
  }

  async updateVariant(userId: string, variantId: string, input: ProductVariantUpdateInput): Promise<ProductVariantResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureVariantExists(variantId, this.variantRepo);

    if (input.sku) {
      const existing = await this.variantRepo.findVariantBySku(input.sku);
      if (existing && existing.id !== variantId) {
        throw new AppError('VARIANT_ALREADY_EXISTS', 409, 'Varian dengan SKU tersebut sudah ada');
      }
    }

    if (input.reorderLevel !== undefined) {
      if (!Number.isInteger(input.reorderLevel) || input.reorderLevel < 0) {
        throw new AppError('INVALID_REORDER_LEVEL', 400, 'Reorder level harus berupa angka bulat minimal 0');
      }
    }
    if (input.isActive === true) {
      const inventory = await this.inventoryRepo.findInventoryByVariantId(variantId);
      const availableStock = inventory ? inventory.onHand - inventory.reserved : 0;
      if (availableStock <= 0) {
        throw new AppError('INSUFFICIENT_STOCK', 400, 'pastikan varian memiliki stok yang cukup sebelum mengaktifkan');
      }
    }
    await this.variantRepo.updateVariant(variantId, input);

    if (input.reorderLevel !== undefined) {
      await this.inventoryRepo.updateInventorySettings(variantId, {
        reorderLevel: input.reorderLevel,
      });
    }

    return ensureVariantExists(variantId, this.variantRepo);
  }

  async deleteVariant(userId: string, variantId: string): Promise<ProductVariantResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureVariantExists(variantId, this.variantRepo);

    try {
      return await this.variantRepo.deleteVariant(variantId);
    } catch {
      throw new AppError('DELETE_VARIANT_FAILED', 409, 'Varian gagal dihapus. Pastikan tidak dipakai transaksi');
    }
  }
}
