import { Router } from 'express';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middlewares/auth';
import * as couponModel from '../models/coupon.model';

const router = Router();

// Protect all coupon routes
router.use(authenticate);

/**
 * POST /api/coupons/validate
 * Validates a coupon code against an order amount and returns the discount.
 */
router.post('/validate', async (req: AuthenticatedRequest, res, next) => {
  try {
    const { code, amount } = req.body;
    
    if (!code || !amount) {
      return res.status(400).json({ error: 'Coupon code and order amount are required.' });
    }

    const baseAmount = parseFloat(amount);
    if (isNaN(baseAmount)) {
      return res.status(400).json({ error: 'Invalid order amount.' });
    }

    const coupon = await couponModel.findCouponByCode(code.toUpperCase());
    
    if (!coupon) {
      return res.status(404).json({ error: 'Invalid coupon code.' });
    }

    const validation = couponModel.validateCoupon(coupon, baseAmount);

    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    return res.json({
      success: true,
      discountAmount: validation.discountAmount,
      message: 'Coupon applied successfully.'
    });

  } catch (error) {
    next(error);
  }
});

// ==========================================
// ADMIN ROUTES (Protected by requireAdmin)
// ==========================================

/**
 * GET /api/coupons
 * Fetch all coupons for the admin dashboard.
 */
router.get('/', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const coupons = await couponModel.getAllCoupons();
    res.json(coupons);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/coupons
 * Create a new coupon
 */
router.post('/', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const data = req.body;
    if (!data.code || !data.discount_type || data.discount_value === undefined) {
      return res.status(400).json({ error: 'Code, discount_type, and discount_value are required.' });
    }
    
    // Ensure code is uppercase and trim spaces
    data.code = data.code.trim().toUpperCase();

    // Check if code already exists
    const existing = await couponModel.findCouponByCode(data.code);
    if (existing) {
      return res.status(400).json({ error: 'A coupon with this code already exists.' });
    }

    const insertId = await couponModel.createCoupon(data);
    res.status(201).json({ success: true, id: insertId, message: 'Coupon created successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/coupons/:id
 * Update an existing coupon
 */
router.put('/:id', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const updates = req.body;
    if (updates.code) {
      updates.code = updates.code.trim().toUpperCase();
    }

    const success = await couponModel.updateCoupon(id, updates);
    if (!success) {
      return res.status(404).json({ error: 'Coupon not found or no changes made' });
    }

    res.json({ success: true, message: 'Coupon updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/coupons/:id
 * Delete a coupon
 */
router.delete('/:id', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid coupon ID' });
    }

    const success = await couponModel.deleteCoupon(id);
    if (!success) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
