import { Router } from 'express';
import { createStockMovement, deleteStockMovement, getStockMovementById, listStockMovements, updateStockMovement } from './stock-movement.controller.js';

const router = Router();

router.post('/', createStockMovement);
router.get('/', listStockMovements);
router.get('/:movementId', getStockMovementById);
router.put('/:movementId', updateStockMovement);
router.delete('/:movementId', deleteStockMovement);

export default router;
