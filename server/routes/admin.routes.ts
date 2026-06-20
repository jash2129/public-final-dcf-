import { Router } from 'express';
import { pool } from '../db';
import * as orderService from '../services/order.service';
import * as orderModel from '../models/order.model';
import * as serviceService from '../services/service.service';
import * as serviceModel from '../models/service.model';
import * as userModel from '../models/user.model';
import * as complianceModel from '../models/compliance.model';
import { validateService, validateOrderStatus } from '../schemas/validation.schema';
import { authenticate, requireAdmin, requireSuperAdmin, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Secure all admin routes
router.use(authenticate);
router.use(requireAdmin);

// --- Administrative Orders Panel ---

/**
 * GET /api/admin/orders
 * List all client orders
 */
router.get('/orders', async (req, res, next) => {
  try {
    const { startDate, endDate, userId } = req.query;
    if (userId !== undefined) {
      const parsedUserId = parseInt(userId as string, 10);
      if (isNaN(parsedUserId)) {
        return res.status(400).json({ error: 'Invalid user ID' });
      }
      const orders = await orderService.getClientOrders(
        parsedUserId,
        startDate as string | undefined,
        endDate as string | undefined
      );
      return res.json(orders);
    }

    const orders = await orderService.getAllClientOrders(
      startDate as string | undefined, 
      endDate as string | undefined
    );
    return res.json(orders);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/orders/:order_id
 * Update status and/or price of an order
 */
router.put('/orders/:order_id', async (req, res, next) => {
  try {
    let { status, amount } = req.body;
    const orderId = req.params.order_id;

    if (status !== undefined) {
      const normalized = status.toLowerCase();
      if (normalized === 'processing') status = 'in_progress';
      else if (normalized === 'action required') status = 'rejected';
      else if (normalized === 'completed') status = 'completed';
      else if (normalized === 'placed') status = 'placed';

      const validation = validateOrderStatus(status);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }
      await orderService.changeOrderStatus(orderId, status);
    }

    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ error: 'Invalid amount value.' });
      }
      await orderModel.updateOrderAmountAndItems(orderId, numericAmount);
    }

    return res.json({ message: `Order ${orderId} updated successfully.` });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/orders/:order_id
 * Update status and/or price of an order
 */
router.patch('/orders/:order_id', async (req, res, next) => {
  try {
    let { status, amount } = req.body;
    const orderId = req.params.order_id;

    if (status !== undefined) {
      const normalized = status.toLowerCase();
      if (normalized === 'processing') status = 'in_progress';
      else if (normalized === 'action required') status = 'rejected';
      else if (normalized === 'completed') status = 'completed';
      else if (normalized === 'placed') status = 'placed';

      const validation = validateOrderStatus(status);
      if (!validation.isValid) {
        return res.status(400).json({ error: 'Validation failed', details: validation.errors });
      }
      await orderService.changeOrderStatus(orderId, status);
    }

    if (amount !== undefined) {
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount < 0) {
        return res.status(400).json({ error: 'Invalid amount value.' });
      }
      await orderModel.updateOrderAmountAndItems(orderId, numericAmount);
    }

    return res.json({ message: `Order ${orderId} updated successfully.` });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PATCH /api/admin/orders/:order_id/status
 * Compatibility endpoint for updating status of an order
 */
router.patch('/orders/:order_id/status', async (req, res, next) => {
  try {
    let { status } = req.body;
    const normalized = status ? status.toLowerCase() : '';
    if (normalized === 'processing') status = 'in_progress';
    else if (normalized === 'action required') status = 'rejected';
    else if (normalized === 'completed') status = 'completed';
    else if (normalized === 'placed') status = 'placed';

    const validation = validateOrderStatus(status);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const orderId = req.params.order_id;
    await orderService.changeOrderStatus(orderId, status);
    return res.json({ message: `Order ${orderId} status updated to ${status} successfully.` });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * DELETE /api/admin/orders/:order_id
 * Delete order from system
 */
router.delete('/orders/:order_id', async (req, res, next) => {
  try {
    const orderId = req.params.order_id;
    const success = await orderModel.deleteOrderRecord(orderId);
    if (!success) {
      return res.status(404).json({ error: `Order ${orderId} not found.` });
    }
    return res.json({ message: `Order ${orderId} deleted successfully.` });
  } catch (error) {
    next(error);
  }
});

// --- Administrative Service Management ---

/**
 * GET /api/admin/services
 * List all service catalog records
 */
router.get('/services', async (req, res, next) => {
  try {
    const services = await serviceService.getServicesCatalog();
    return res.json(services);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/services
 * Create a new service catalog record (Admin only)
 */
router.post('/services', async (req, res, next) => {
  try {
    const validation = validateService(req.body);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    const serviceId = await serviceService.addNewService(req.body);
    const service = await serviceModel.findServiceById(serviceId);
    return res.status(201).json({
      message: 'Service added successfully to catalog',
      service
    });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

/**
 * PUT /api/admin/services/:id
 * Update pricing or descriptive details of a service
 */
router.put('/services/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid service ID format' });
    }

    const validation = validateService(req.body, true);
    if (!validation.isValid) {
      return res.status(400).json({ error: 'Validation failed', details: validation.errors });
    }

    await serviceService.updateServiceDetails(id, req.body);
    const service = await serviceModel.findServiceById(id);
    return res.json({
      message: 'Service catalog record updated',
      service
    });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ error: error.message });
    }
    next(error);
  }
});

import { runComplianceScan } from '../services/scheduler.service';

// --- Administrative Compliance Panel ---

/**
 * POST /api/admin/compliance/trigger-scan
 * Force-run the scheduler scan manually for testing/auditing
 */
router.post('/compliance/trigger-scan', async (req, res, next) => {
  try {
    const result = await runComplianceScan();
    return res.json({
      message: 'Compliance scan executed successfully.',
      result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/compliance
 * List all compliance tasks for all clients
 */
router.get('/compliance', async (req, res, next) => {
  try {
    const tasks = await complianceModel.listAllComplianceTasks();
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/compliance
 * Assign a statutory compliance task to a client
 */
router.post('/compliance', async (req, res, next) => {
  try {
    const { title, dueDate, type, penalty, userId, serviceId } = req.body;
    if (!title || !dueDate || !userId) {
      return res.status(400).json({ error: 'Title, dueDate, and userId are required fields' });
    }

    const taskId = await complianceModel.createComplianceTask({
      title,
      dueDate,
      status: 'upcoming',
      type: type || 'Taxation',
      penalty: penalty || null,
      user_id: parseInt(userId, 10),
      service_id: serviceId ? parseInt(serviceId, 10) : undefined
    });

    const task = await complianceModel.findComplianceTaskById(taskId);
    return res.status(201).json({
      message: 'Compliance task assigned to user successfully.',
      task
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/admin/compliance/:id
 * Update status of a compliance task
 */
router.put('/compliance/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    const { status } = req.body;
    if (!status || !['upcoming', 'overdue', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status must be provided' });
    }

    await complianceModel.updateComplianceTaskStatus(id, status);
    return res.json({ message: 'Compliance task status updated successfully.' });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/admin/compliance/:id
 * Delete compliance task
 */
router.delete('/compliance/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });

    await complianceModel.deleteComplianceTask(id);
    return res.json({ message: 'Compliance task deleted.' });
  } catch (error) {
    next(error);
  }
});

// --- Administrative User Profiles & Roles Panel ---

/**
 * GET /api/admin/users
 * Directory lookup of system clients
 */
router.get('/users', async (req, res, next) => {
  try {
    const users = await userModel.listAllUsers();
    return res.json(users);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/users/:id
 * Retrieve a specific client's profile details along with their uploaded documents
 */
router.get('/users/:id', async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID format' });

    const user: any = await userModel.findUserById(id);
    if (!user) {
      return res.status(404).json({ error: `User with ID ${id} not found.` });
    }

    // Fetch user documents to return with profile
    const [documents] = await pool.query('SELECT * FROM documents WHERE user_id = ?', [id]);
    user.documents = documents;

    return res.json(user);
  } catch (error) {
    next(error);
  }
});

const updateUserRoleHandler = async (req: any, res: any, next: any) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid user ID format' });

    const { role } = req.body;
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role must be user or admin' });
    }

    const success = await userModel.updateUserRole(id, role);
    if (!success) {
      return res.status(400).json({ error: 'Could not update user role. User may not exist or is a Super Admin.' });
    }

    return res.json({ message: `User role modified to ${role}.` });
  } catch (error) {
    next(error);
  }
};

router.put('/users/:id/role', requireSuperAdmin, updateUserRoleHandler);
router.patch('/users/:id/role', requireSuperAdmin, updateUserRoleHandler);

export default router;
