import { Router } from 'express';
import productRoutes from './product/product.routes.js';
import categoryRoutes from './category/category.routes.js';
import { variantRoutes, productNestedVariantRoutes } from './variant/variant.routes.js';
import stockMovementRoutes from './stock-movement/stock-movement.routes.js';
import { productMediaRoutes, productNestedMediaRoutes } from './product-media/product-media.routes.js';
import catalogRoutes from './catalog/catalog.routes.js';
import { requireAccessToken, requireSeller } from '../../middleware/requireInternalToken.js';
import wishlistRoutes from './wishlist/wishlist.routes.js';
import cartRoutes from './cart/cart.routes.js';
const router = Router();

router.use(requireAccessToken, requireSeller);

router.use('/categories', categoryRoutes);
router.use('/wishlists', wishlistRoutes);
router.use('/carts', cartRoutes);
router.use('/variants', variantRoutes);
router.use('/stock-movements', stockMovementRoutes);
router.use('/media', productMediaRoutes);
router.use('/search-catalog', catalogRoutes);

router.use('/:productId/media', productNestedMediaRoutes);
router.use('/:productId/variants', productNestedVariantRoutes);
router.use('/', productRoutes);

export default router;
