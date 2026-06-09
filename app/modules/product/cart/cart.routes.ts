import { Router } from 'express';
import { addToCart, deleteFromCart, getCart, updateCartItemQuantity } from './cart.controller.js';

const router = Router();

router.post('/:productId', addToCart);
router.patch('/:productId', updateCartItemQuantity);
router.delete('/:productId', deleteFromCart);
router.get('/', getCart);

export default router;
