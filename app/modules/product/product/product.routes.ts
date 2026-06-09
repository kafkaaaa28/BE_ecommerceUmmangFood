import { Router } from 'express';
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct } from './product.controller.js';

const router = Router();

router.post('/', createProduct);
router.get('/', listProducts);
router.get('/:productId', getProductById);
router.put('/:productId', updateProduct);
router.delete('/:productId', deleteProduct);

export default router;
