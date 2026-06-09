import type { AuthService } from '../../auth/auth.services.js';
import type { UserRepository } from '../../user/user.repository.js';
import { AppError } from '../../error/AppError.js';
import type { InventoryResponse, InventoryUpdateInput } from '../product.types.js';
import { ensureSeller, ensureVariantExists } from '../product.access.js';
import type { InventoryRepository } from './inventory.repository.js';
import type { VariantRepository } from '../variant/variant.repository.js';

export class InventoryService {
  constructor(
    private readonly inventoryRepo: InventoryRepository,
    private readonly variantRepo: VariantRepository,
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
  ) {}

  async getInventoryByVariantId(userId: string, variantId: string): Promise<InventoryResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureVariantExists(variantId, this.variantRepo);

    const inventory = await this.inventoryRepo.findInventoryByVariantId(variantId);
    if (!inventory) {
      throw new AppError('INVENTORY_NOT_FOUND', 404, 'Inventory tidak ditemukan');
    }

    return inventory;
  }

  async updateInventoryByVariantId(userId: string, variantId: string, input: InventoryUpdateInput): Promise<InventoryResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    await ensureVariantExists(variantId, this.variantRepo);
    return this.inventoryRepo.updateInventorySettings(variantId, input);
  }
}
