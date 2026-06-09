import { Router } from 'express';
import * as complianceModel from '../models/compliance.model';
import { authenticate, AuthenticatedRequest } from '../middlewares/auth';

const router = Router();

// Protect compliance routes
router.use(authenticate);

/**
 * GET /api/compliance
 * Fetch list of compliance calendar tasks for the logged in user
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const tasks = await complianceModel.listUserComplianceTasks(req.user.id);
    return res.json(tasks);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/compliance
 * Add a custom compliance task to the calendar
 */
router.post('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    
    const { title, dueDate, type, penalty } = req.body;
    if (!title || !dueDate) {
      return res.status(400).json({ error: 'Title and due date are required' });
    }

    const taskId = await complianceModel.createComplianceTask({
      title,
      dueDate,
      status: 'upcoming',
      type: type || 'ROC Compliance',
      penalty: penalty || null,
      user_id: req.user.id
    });

    const newTask = await complianceModel.findComplianceTaskById(taskId);
    return res.status(201).json({
      message: 'Compliance task added successfully',
      task: newTask
    });
  } catch (error) {
    next(error);
  }
});

export default router;
