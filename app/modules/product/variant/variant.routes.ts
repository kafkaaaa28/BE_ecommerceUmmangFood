import { Router } from 'express';
import { createVariant, deleteVariant, getVariantById, listVariantsByProductId, updateVariant } from './variant.controller.js';
import inventoryRoutes from '../inventory/inventory.routes.js';

const variantRoutes = Router();
const productNestedVariantRoutes = Router({ mergeParams: true });

variantRoutes.get('/:variantId', getVariantById);
variantRoutes.put('/:variantId', updateVariant);
variantRoutes.delete('/:variantId', deleteVariant);
variantRoutes.use('/:variantId/inventory', inventoryRoutes);

productNestedVariantRoutes.post('/', createVariant);
productNestedVariantRoutes.get('/', listVariantsByProductId);

export { variantRoutes, productNestedVariantRoutes };
export default variantRoutes;
