import { Router } from 'express';
import { createCategory, deleteCategory, getCategoryById, listCategories, updateCategory } from './category.controller.js';

const router = Router();

router.post('/', createCategory);
router.get('/', listCategories);
router.get('/:categoryId', getCategoryById);
router.put('/:categoryId', updateCategory);
router.delete('/:categoryId', deleteCategory);

export default router;
