import { Router } from 'express';
import { getInventoryByVariantId, updateInventoryByVariantId } from './inventory.controller.js';

const router = Router({ mergeParams: true });

router.get('/', getInventoryByVariantId);
router.put('/', updateInventoryByVariantId);

export default router;
