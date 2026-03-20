import { Router } from 'express';
import { getUsers, getUserBySlug, updateProfile, updateUserRole, deleteUser } from '../controllers/userController';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, requireRole('ADMIN'), getUsers);
router.get('/:slug', getUserBySlug);
router.put('/me/profile', authenticate, updateProfile);
router.put('/:id/role', authenticate, requireRole('ADMIN'), updateUserRole);
router.delete('/:id', authenticate, requireRole('ADMIN'), deleteUser);

export default router;
