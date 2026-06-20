import { Router } from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth';
import * as orderModel from '../models/order.model';
import { generateInvoiceBuffer } from '../services/invoice.service';
import { pool } from '../db';

const router = Router();

// Secure all admin invoice routes
router.use(authenticate);
router.use(requireAdmin);

/**
 * GET /api/admin/invoices/user/:userId
 * Fetch orders (mapped as invoices) and associated invoice data for a specific user.
 */
router.get('/user/:userId', async (req, res, next) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // 1. Fetch user orders and map them to the invoice format
    const orders = await orderModel.findOrdersByUserId(userId);
    const orderInvoices = orders.map((o: any) => ({
      id: o.id,
      orderId: o.id,
      date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
      amount: `₹${o.total_amount.toLocaleString('en-IN')}`,
      status: o.payment_status === 'paid' ? 'Paid' : 'Pending',
      service: o.service_names || 'General Filing Services'
    }));

    // 2. Fetch seeded invoice records from invoices table
    const [dbInvoices] = await pool.query<any[]>('SELECT * FROM invoices WHERE user_id = ?', [userId]);
    const dbInvoicesMapped = dbInvoices.map((inv: any) => ({
      ...inv,
      orderId: inv.id
    }));

    // 3. Return combined list of invoices
    return res.json([...orderInvoices, ...dbInvoicesMapped]);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/invoices/:orderId/download
 * Generate a PDF for an order or a seeded invoice and serve it as a download.
 */
router.get('/:orderId/download', async (req, res, next) => {
  try {
    const { orderId } = req.params;

    // Check if it is a seeded invoice ID (starts with "INV-")
    if (orderId.startsWith('INV-')) {
      const [rows] = await pool.query<any[]>('SELECT * FROM invoices WHERE id = ?', [orderId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }
      const invoice = rows[0];
      const [userRows] = await pool.query<any[]>('SELECT name, email FROM users WHERE id = ?', [invoice.user_id]);
      const user = userRows[0];

      // Parse amount string like "₹15,000" to number
      const cleanAmountStr = invoice.amount.replace(/[₹,]/g, '');
      const numericAmount = parseFloat(cleanAmountStr) || 0;

      const pdfBuffer = await generateInvoiceBuffer(
        invoice.id,
        numericAmount,
        user?.name || 'Client',
        user?.email || '',
        invoice.service || 'General Filing Services'
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);
      return res.send(pdfBuffer);
    }

    // Otherwise, assume it is a real order ID (starts with "DCF-")
    const order = await orderModel.findOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const items = await orderModel.getOrderItems(orderId);
    const serviceName = items.length > 0 && items[0].service_name 
      ? items[0].service_name 
      : 'General Filing Services';

    const pdfBuffer = await generateInvoiceBuffer(
      order.id,
      order.total_amount,
      order.user_name || 'Client',
      order.user_email || '',
      serviceName
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${orderId}.pdf`);
    return res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
