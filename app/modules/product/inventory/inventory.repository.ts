import { prisma } from '../../../config/prisma.js';
import type { InventoryResponse, InventoryUpdateInput } from '../product.types.js';
import { inventorySelect } from '../product.selects.js';

export class InventoryRepository {
  async findInventoryById(inventoryId: string): Promise<InventoryResponse | null> {
    return prisma.inventory.findUnique({
      where: { id: inventoryId },
      select: inventorySelect,
    });
  }

  async findInventoryByVariantId(variantId: string): Promise<InventoryResponse | null> {
    return prisma.inventory.findUnique({
      where: { variantId },
      select: inventorySelect,
    });
  }

  async updateInventorySettings(variantId: string, input: InventoryUpdateInput): Promise<InventoryResponse> {
    return prisma.inventory.update({
      where: { variantId },
      data: {
        ...(input.reorderLevel !== undefined ? { reorderLevel: input.reorderLevel } : {}),
      },
      select: inventorySelect,
    });
  }
}
