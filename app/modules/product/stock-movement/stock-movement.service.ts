import type { AuthService } from '../../auth/auth.services.js';
import type { UserRepository } from '../../user/user.repository.js';
import type { StockMovementInput, StockMovementListQuery, StockMovementResponse, StockMovementUpdateInput } from '../product.types.js';
import { ensureInventoryExistsById, ensureSeller, ensureStockMovementExists } from '../product.access.js';
import { applyDelta, assertInventoryState, invertDelta, movementToDelta, normalizeMovement } from '../product.inventory.js';
import type { InventoryRepository } from '../inventory/inventory.repository.js';
import type { StockMovementRepository } from './stock-movement.repository.js';

export class StockMovementService {
  constructor(
    private readonly stockMovementRepo: StockMovementRepository,
    private readonly inventoryRepo: InventoryRepository,
    private readonly authService: AuthService,
    private readonly userRepo: UserRepository,
  ) {}

  async createStockMovement(userId: string, input: StockMovementInput): Promise<StockMovementResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    normalizeMovement(input);

    const inventory = await ensureInventoryExistsById(input.inventoryId, this.inventoryRepo);
    const delta = movementToDelta(input.type, input.qty);
    const nextInventory = applyDelta(inventory, delta);
    assertInventoryState(nextInventory);

    return this.stockMovementRepo.createStockMovement(input, userId, nextInventory);
  }

  async listStockMovements(userId: string, query: StockMovementListQuery): Promise<StockMovementResponse[]> {
    await ensureSeller(userId, this.authService, this.userRepo);

    if (query.inventoryId) {
      await ensureInventoryExistsById(query.inventoryId, this.inventoryRepo);
    }

    return this.stockMovementRepo.listStockMovements(query);
  }

  async getStockMovementById(userId: string, movementId: string): Promise<StockMovementResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);
    return ensureStockMovementExists(movementId, this.stockMovementRepo);
  }

  async updateStockMovement(userId: string, movementId: string, input: StockMovementUpdateInput): Promise<StockMovementResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);

    const movement = await ensureStockMovementExists(movementId, this.stockMovementRepo);
    const inventory = await ensureInventoryExistsById(movement.inventoryId, this.inventoryRepo);

    const currentMovement = {
      type: movement.type,
      qty: movement.qty,
    };

    const nextMovement = {
      type: input.type ?? movement.type,
      qty: input.qty ?? movement.qty,
    };

    normalizeMovement(nextMovement);

    const baseline = applyDelta(inventory, invertDelta(movementToDelta(currentMovement.type, currentMovement.qty)));
    assertInventoryState(baseline);

    const nextInventory = applyDelta(baseline, movementToDelta(nextMovement.type, nextMovement.qty));
    assertInventoryState(nextInventory);

    return this.stockMovementRepo.updateStockMovement(movementId, input, nextInventory);
  }

  async deleteStockMovement(userId: string, movementId: string): Promise<StockMovementResponse> {
    await ensureSeller(userId, this.authService, this.userRepo);

    const movement = await ensureStockMovementExists(movementId, this.stockMovementRepo);
    const inventory = await ensureInventoryExistsById(movement.inventoryId, this.inventoryRepo);
    const nextInventory = applyDelta(inventory, invertDelta(movementToDelta(movement.type, movement.qty)));
    assertInventoryState(nextInventory);

    return this.stockMovementRepo.deleteStockMovement(movementId, nextInventory);
  }
}
