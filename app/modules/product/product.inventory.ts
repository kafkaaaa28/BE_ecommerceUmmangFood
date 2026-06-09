import { AppError } from '../error/AppError.js';
import type { InventoryDelta, InventoryResponse, StockMovementInput, StockMovementType } from './product.types.js';

type InventoryState = Pick<InventoryResponse, 'onHand' | 'reserved'>;

export function normalizeMovement(input: Pick<StockMovementInput, 'type' | 'qty'>) {
  if (input.type === 'ADJUSTMENT') {
    if (input.qty === 0) {
      throw new AppError('INVALID_MOVEMENT_QTY', 400, 'Qty adjustment tidak boleh 0');
    }
    return;
  }

  if (input.qty <= 0) {
    throw new AppError('INVALID_MOVEMENT_QTY', 400, 'Qty stock movement harus lebih dari 0');
  }
}

export function movementToDelta(type: StockMovementType, qty: number): InventoryDelta {
  switch (type) {
    case 'STOCK_IN':
      return { onHand: qty, reserved: 0 };
    case 'STOCK_OUT':
      return { onHand: -qty, reserved: 0 };
    case 'ADJUSTMENT':
      return { onHand: qty, reserved: 0 };
    case 'RESERVE':
      return { onHand: 0, reserved: qty };
    case 'RELEASE':
      return { onHand: 0, reserved: -qty };
    case 'DEDUCT':
      return { onHand: -qty, reserved: -qty };
    default:
      return { onHand: 0, reserved: 0 };
  }
}

export function invertDelta(delta: InventoryDelta): InventoryDelta {
  return {
    onHand: -delta.onHand,
    reserved: -delta.reserved,
  };
}

export function applyDelta(current: InventoryState, delta: InventoryDelta): InventoryState {
  return {
    onHand: current.onHand + delta.onHand,
    reserved: current.reserved + delta.reserved,
  };
}

export function assertInventoryState(inventory: InventoryState) {
  if (inventory.onHand < 0) {
    throw new AppError('INSUFFICIENT_ON_HAND', 400, 'Stok on hand tidak mencukupi');
  }

  if (inventory.reserved < 0) {
    throw new AppError('INSUFFICIENT_RESERVED', 400, 'Stok reserved tidak mencukupi');
  }

  if (inventory.reserved > inventory.onHand) {
    throw new AppError('INVALID_INVENTORY_STATE', 400, 'Reserved stock tidak boleh melebihi on hand');
  }
}
