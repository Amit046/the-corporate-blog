import { Router } from 'express';
import { getCategories, getCategoryBySlug, createCategory, updateCategory, deleteCategory } from '../controllers/categoryController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', authenticate, requireRole('ADMIN', 'EDITOR'), createCategory);
router.put('/:id', authenticate, requireRole('ADMIN', 'EDITOR'), updateCategory);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteCategory);

export default router;
