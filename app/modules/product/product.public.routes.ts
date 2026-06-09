import { Router } from 'express';
import { publicListProducts } from './product/product.controller.js';

const router = Router();

router.use('/products', publicListProducts);

export default router;
