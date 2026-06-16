import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import { pool } from '../db';
import { authenticate, requireSuperAdmin, AuthenticatedRequest } from '../middlewares/auth';
import mysql from 'mysql2/promise';

const router = Router();
const uploadsDir = path.join(process.cwd(), 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir, { recursive: true });

// Configure Multer for Avatar storage
const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarsDir),
  filename: (req: any, file, cb) => {
    const unique = `${req.user.id}-${Date.now()}`;
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${unique}${ext}`);
  },
});
const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: 1024 * 1024 }, // 1MB limit for avatars
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only images are allowed') as any, false);
  }
});

/**
 * Log activity helper
 */
async function logActivity(userId: number, action: string, details: string) {
  try {
    const [users] = await pool.query<any[]>('SELECT name, email FROM users WHERE id = ?', [userId]);
    const user = users[0];
    await pool.execute(
      'INSERT INTO activity_log (user_id, action, details, user_name, user_email) VALUES (?, ?, ?, ?, ?)',
      [userId, action, details, user?.name || 'Unknown', user?.email || 'Unknown']
    );
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}

// Require authentication for all profile/stats routes
router.use(authenticate);

/**
 * GET /api/user/profile
 * Get authenticated user profile data
 */
router.get('/user/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const [users] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT id, name, email, role, phone, whatsapp_number, avatar, company_name, address, gstin, notification_prefs FROM users WHERE id = ?',
      [req.user.id]
    );
    if (users.length === 0) return res.status(404).json({ error: "User not found" });

    const user = users[0];
    if (user.notification_prefs && typeof user.notification_prefs === 'string') {
      try {
        user.notification_prefs = JSON.parse(user.notification_prefs);
      } catch (e) {
        user.notification_prefs = { email: true, sms: false };
      }
    } else if (!user.notification_prefs) {
      user.notification_prefs = { email: true, sms: false };
    }

    return res.json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/user/profile
 * Update user details
 */
router.patch('/user/profile', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { name, email, phone, whatsapp_number, company_name, address, gstin } = req.body;

    if (whatsapp_number) {
      if (!/^\+?[0-9]{10,15}$/.test(whatsapp_number.trim())) {
        return res.status(400).json({ error: 'A valid WhatsApp number is required (10-15 digits)' });
      }
      const [existing] = await pool.query<mysql.RowDataPacket[]>(
        'SELECT id FROM users WHERE whatsapp_number = ? AND id != ?',
        [whatsapp_number, req.user.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'WhatsApp number is already in use' });
      }
    }

    await pool.execute(
      'UPDATE users SET name = ?, email = ?, phone = ?, whatsapp_number = ?, company_name = ?, address = ?, gstin = ? WHERE id = ?',
      [name, email, phone, whatsapp_number, company_name, address, gstin, req.user.id]
    );

    await logActivity(req.user.id, 'PROFILE_UPDATE', 'Updated profile information');
    return res.json({ message: "Profile updated successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/user/password
 * Update user password
 */
router.patch('/user/password', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { currentPassword, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    const [users] = await pool.query<mysql.RowDataPacket[]>("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const user = users[0];
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Incorrect current password" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.execute("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, req.user.id]);
    
    await logActivity(req.user.id, 'PASSWORD_CHANGE', 'Changed account password');
    return res.json({ message: "Password updated successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/user/notifications
 * Update notification preferences
 */
router.patch('/user/notifications', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { email, sms } = req.body;
    
    const prefs = JSON.stringify({ email, sms });
    await pool.execute('UPDATE users SET notification_prefs = ? WHERE id = ?', [prefs, req.user.id]);
    return res.json({ message: "Notification preferences updated" });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/user/avatar
 * Upload profile avatar
 */
router.post('/user/avatar', uploadAvatar.single('avatar'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, req.user.id]);
    
    await logActivity(req.user.id, 'AVATAR_UPDATE', 'Uploaded new profile avatar');
    return res.json({ message: "Avatar updated successfully", avatarUrl });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/invoices
 * Get invoices for the user
 */
router.get('/invoices', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const [invoices] = await pool.query('SELECT * FROM invoices WHERE user_id = ?', [req.user.id]);
    return res.json(invoices);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/activity
 * Get activity requests statistics (ROC / compliance / logins charts)
 */
router.get('/stats/activity', async (req, res, next) => {
  try {
    const [stats] = await pool.query('SELECT name, requests FROM activity_stats ORDER BY id ASC');
    return res.json(stats);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/stats/summary
 * Get summary of active orders, documents count, completed count
 */
router.get('/stats/summary', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const [orderStats] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT status, COUNT(*) as count FROM orders WHERE user_id = ? GROUP BY status',
      [req.user.id]
    );
    const [docStats] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = ?', 
      [req.user.id]
    );

    const summary = { 
      activeOrders: 0, 
      completed: 0, 
      actionRequired: 0, 
      totalDocuments: docStats[0].count 
    };

    orderStats.forEach((s: any) => {
      // Map database statuses ('placed', 'in_progress', 'completed', 'rejected') to frontend expected title cased fields
      if (s.status === 'completed' || s.status === 'Completed') {
        summary.completed += s.count;
      } else if (s.status === 'rejected' || s.status === 'Action Required') {
        summary.actionRequired += s.count;
      } else {
        summary.activeOrders += s.count;
      }
    });

    return res.json(summary);
  } catch (error) {
    next(error);
  }
});

// --- Super Admin Activity Logs and Passwords ---

/**
 * GET /api/admin/activity
 * Super admin view log stream
 */
router.get('/admin/activity', requireSuperAdmin, async (_req, res, next) => {
  try {
    const [logs] = await pool.query('SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 200');
    return res.json(logs);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/admin/users/:id/password
 * Force reset client password
 */
router.patch('/admin/users/:id/password', requireSuperAdmin, async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const [result]: any = await pool.execute(
      'UPDATE users SET password = ? WHERE id = ? AND role != "super_admin"', 
      [hashedPassword, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found or protected super_admin" });

    await logActivity(req.user.id, 'ADMIN_PASSWORD_RESET', `Admin reset password for user (ID: ${id})`);
    return res.json({ message: "User password reset successfully" });
  } catch (error) {
    next(error);
  }
});

export default router;
