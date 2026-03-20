import { Router } from 'express';
import { redirectAffiliate, createAffiliateLink, getAffiliateLinks } from '../controllers/affiliateController';
import { authenticate, requireRole } from '../middleware/auth';
const router = Router();
router.get('/:slug', redirectAffiliate);
router.post('/', authenticate, requireRole('ADMIN'), createAffiliateLink);
router.get('/', authenticate, requireRole('ADMIN'), getAffiliateLinks);
export default router;
