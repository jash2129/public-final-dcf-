import { Router } from 'express';
import * as orderService from '../services/order.service';
import * as orderModel from '../models/order.model';
import { validateOrder } from '../schemas/validation.schema';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';
import * as paymentService from '../services/payment.service';

const router = Router();

// Protect all order routes by default
router.use(authenticate);

/**
 * POST /api/orders
 * Check out a service. Enforces backend fixed pricing catalog.
 */
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.user.phone || req.user.phone.trim() === '') {
      return res.status(403).json({ error: 'Phone number is required to place an order.' });
    }

    const validation = validateOrder(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const orderId = await orderService.checkout(req.user.id, req.body);
    
    // Fetch newly created order in expected format
    const dbOrder = await orderModel.findOrderById(orderId);
    const dbItems = await orderModel.getOrderItems(orderId);
    
    const formatted = orderService.mapToLegacyOrder({
      ...dbOrder,
      service_names: dbItems.map(i => i.service_name).join(', ')
    });

    return res.status(201).json({
      message: 'Order created successfully',
      orderId,
      order: formatted
    });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * GET /api/orders
 * Retrieve list of orders for the authenticated client (legacy compatibility path).
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { startDate, endDate } = req.query;
    
    const orders = await orderService.getClientOrders(
      req.user.id, 
      startDate as string | undefined, 
      endDate as string | undefined
    );
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/my
 * Retrieve list of orders for the authenticated client (new path).
 */
router.get('/my', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { startDate, endDate } = req.query;

    const orders = await orderService.getClientOrders(
      req.user.id, 
      startDate as string | undefined, 
      endDate as string | undefined
    );
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/orders/:order_id
 * Retrieve detail views of a single order.
 */
router.get('/:order_id', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const orderId = req.params.order_id;
    const order = await orderModel.findOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: `Order with ID ${orderId} not found.` });
    }

    // Verify ownership or check if staff
    if (order.user_id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ error: 'Forbidden. You do not own this order.' });
    }

    const items = await orderModel.getOrderItems(orderId);
    
    return res.json({
      ...order,
      items
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/orders/:id/pay/initiate
 * Initiate a Razorpay payment transaction.
 */
router.post('/:id/pay/initiate', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const orderId = req.params.id;
    const paymentData = await paymentService.initiatePayment(orderId, req.user.id);
    return res.json(paymentData);
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * POST /api/orders/:id/pay/verify
 * Verify Razorpay payment signature.
 */
router.post('/:id/pay/verify', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const orderId = req.params.id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing required Razorpay payment fields.' });
    }

    const isValid = await paymentService.verifyPaymentSignature(
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (isValid) {
      return res.json({ success: true, message: 'Payment verified and captured.' });
    } else {
      return res.status(400).json({ success: false, error: 'Signature verification failed.' });
    }
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

export default router;
