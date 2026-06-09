import { Router } from 'express';
import { searchCatalog } from './catalog.controller.js';

const router = Router();

router.get('/', searchCatalog);

export default router;
