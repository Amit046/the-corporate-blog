import { Router } from 'express';
import { getDashboardStats, getAuditLogs } from '../controllers/analyticsController';
import { authenticate, requireRole } from '../middleware/auth';
const router = Router();
router.get('/stats', authenticate, requireRole('ADMIN', 'EDITOR'), getDashboardStats);
router.get('/audit-logs', authenticate, requireRole('ADMIN'), getAuditLogs);
export default router;
