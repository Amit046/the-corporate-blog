import { Router } from 'express';
import {
  getPosts, getPostBySlug, createPost, updatePost,
  publishPost, deletePost, getPopularPosts, getInternalSuggestions
} from '../controllers/postController';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth';

const router = Router();

router.get('/', optionalAuth, getPosts);
router.get('/popular', getPopularPosts);
router.get('/slug/:slug', optionalAuth, getPostBySlug);
router.get('/:id/internal-suggestions', getInternalSuggestions);

router.post('/', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), createPost);
router.put('/:id', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), updatePost);
router.put('/:id/publish', authenticate, requireRole('ADMIN', 'EDITOR'), publishPost);
router.delete('/:id', authenticate, requireRole('ADMIN', 'EDITOR', 'WRITER'), deletePost);

export default router;
