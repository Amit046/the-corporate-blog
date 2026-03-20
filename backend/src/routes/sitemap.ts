import { Router } from 'express';
import { getSitemapXml, getRobotsTxt } from '../controllers/sitemapController';
const router = Router();
router.get('/sitemap.xml', getSitemapXml);
router.get('/robots.txt', getRobotsTxt);
export default router;
