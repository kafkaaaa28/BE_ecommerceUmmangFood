import { Router } from 'express';
import { addToWishlist, deleteFromWishlist, getWishlist } from './wishlist.controller.js';
const router = Router();

router.post('/:productId', addToWishlist);
router.delete('/:productId', deleteFromWishlist);
router.get('/', getWishlist);
export default router;
