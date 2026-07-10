import { Router } from 'express';
import * as serviceService from '../services/service.service';

const router = Router();

/**
 * GET /api/services
 * Get list of all services in the catalog
 */
router.get('/', async (req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const services = await serviceService.getServicesCatalog();
    return res.json(services);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/services/:id
 * Retrieve details for a single service
 */
router.get('/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }
    const service = await serviceService.getServiceDetails(id);
    return res.json(service);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
