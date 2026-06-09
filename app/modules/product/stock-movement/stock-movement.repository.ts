import { prisma } from '../../../config/prisma.js';
import crypto from 'crypto';
import type { InventoryDelta, StockMovementInput, StockMovementListQuery, StockMovementResponse, StockMovementUpdateInput } from '../product.types.js';
import { stockMovementSelect } from '../product.selects.js';

export class StockMovementRepository {
  async listStockMovements(query: StockMovementListQuery): Promise<StockMovementResponse[]> {
    return prisma.stockMovement.findMany({
      where: {
        ...(query.inventoryId ? { inventoryId: query.inventoryId } : {}),
        ...(query.type ? { type: query.type } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: stockMovementSelect,
    });
  }

  async findStockMovementById(movementId: string): Promise<StockMovementResponse | null> {
    return prisma.stockMovement.findUnique({
      where: { id: movementId },
      select: stockMovementSelect,
    });
  }

  async createStockMovement(input: StockMovementInput, actorId: string, nextInventory: InventoryDelta): Promise<StockMovementResponse> {
    return prisma.$transaction(async (tx) => {
      await tx.inventory.update({
        where: { id: input.inventoryId },
        data: {
          onHand: nextInventory.onHand,
          reserved: nextInventory.reserved,
        },
      });

      return tx.stockMovement.create({
        data: {
          id: crypto.randomUUID(),
          inventoryId: input.inventoryId,
          type: input.type,
          qty: input.qty,
          note: input.note ?? null,
          refType: input.refType ?? null,
          refId: input.refId ?? null,
          actorId,
        },
        select: stockMovementSelect,
      });
    });
  }

  async updateStockMovement(movementId: string, input: StockMovementUpdateInput, nextInventory: InventoryDelta): Promise<StockMovementResponse> {
    return prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.findUnique({
        where: { id: movementId },
        select: { inventoryId: true },
      });

      if (!movement) {
        throw new Error('STOCK_MOVEMENT_NOT_FOUND');
      }

      await tx.inventory.update({
        where: { id: movement.inventoryId },
        data: {
          onHand: nextInventory.onHand,
          reserved: nextInventory.reserved,
        },
      });

      return tx.stockMovement.update({
        where: { id: movementId },
        data: {
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.qty !== undefined ? { qty: input.qty } : {}),
          ...(input.note !== undefined ? { note: input.note ?? null } : {}),
          ...(input.refType !== undefined ? { refType: input.refType ?? null } : {}),
          ...(input.refId !== undefined ? { refId: input.refId ?? null } : {}),
        },
        select: stockMovementSelect,
      });
    });
  }

  async deleteStockMovement(movementId: string, nextInventory: InventoryDelta): Promise<StockMovementResponse> {
    return prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.findUnique({
        where: { id: movementId },
        select: { inventoryId: true },
      });

      if (!movement) {
        throw new Error('STOCK_MOVEMENT_NOT_FOUND');
      }

      await tx.inventory.update({
        where: { id: movement.inventoryId },
        data: {
          onHand: nextInventory.onHand,
          reserved: nextInventory.reserved,
        },
      });

      return tx.stockMovement.delete({
        where: { id: movementId },
        select: stockMovementSelect,
      });
    });
  }
}
