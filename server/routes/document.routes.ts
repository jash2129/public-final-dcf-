import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middlewares/auth';
import mysql from 'mysql2/promise';

const router = Router();
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer disk storage setup
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB limit

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

// All document routes require authentication
router.use(authenticate);

/**
 * GET /api/documents
 * List all documents for the authenticated client
 */
router.get('/', async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const [documents] = await pool.query('SELECT * FROM documents WHERE user_id = ?', [req.user.id]);
    return res.json(documents);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/documents
 * Upload a document with strict size limits (50-100KB for images, 100-200KB for PDFs)
 */
router.post('/', upload.single('file'), async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { folder, order_id } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ error: "No file uploaded" });

    // Enforce size limits matching the original constraints
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    const isPDF = ext === 'pdf';

    if (isImage) {
      if (file.size < 50 * 1024) return res.status(400).json({ error: "Image must be at least 50 KB" });
      if (file.size > 100 * 1024) return res.status(400).json({ error: "Image must be below 100 KB" });
    } else if (isPDF) {
      if (file.size < 100 * 1024) return res.status(400).json({ error: "PDF must be at least 100 KB" });
      if (file.size > 200 * 1024) return res.status(400).json({ error: "PDF must be below 200 KB" });
    } else {
      return res.status(400).json({ error: "Only Images (50-100KB) and PDFs (100-200KB) are allowed" });
    }

    const typeMap: Record<string, string> = { 
      pdf: 'pdf', 
      jpg: 'image', 
      jpeg: 'image', 
      png: 'image', 
      zip: 'archive', 
      rar: 'archive', 
      doc: 'word', 
      docx: 'word' 
    };
    const type = typeMap[ext] || ext;
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    await pool.execute(
      'INSERT INTO documents (name, type, size, date, folder, file_path, order_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [file.originalname, type, sizeMB, date, folder || 'General', file.filename, order_id || null, req.user.id]
    );

    await logActivity(req.user.id, 'UPLOAD', `Uploaded document: ${file.originalname}`);

    return res.status(201).json({ message: "Document uploaded successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/documents/:id/rename
 * Rename client document
 */
router.patch('/:id/rename', async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const [result]: any = await pool.execute(
      'UPDATE documents SET name = ? WHERE id = ? AND user_id = ?', 
      [name, id, req.user.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });

    await logActivity(req.user.id, 'RENAME', `Renamed document (ID: ${id}) to: ${name}`);
    return res.json({ message: "Document renamed successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/:id/file
 * Download a document file
 */
router.get('/:id/file', async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    if (!rows.length || !rows[0].file_path) return res.status(404).json({ error: "File not found" });
    
    const filePath = path.join(uploadsDir, rows[0].file_path);
    return res.download(filePath, rows[0].name);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/documents/:id
 * Delete document file and row from database
 */
router.delete('/:id', async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const [rows] = await pool.query<mysql.RowDataPacket[]>(
      'SELECT * FROM documents WHERE id = ? AND user_id = ?', 
      [id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Document not found or unauthorized" });
    
    if (rows[0].file_path) {
      const filePath = path.join(uploadsDir, rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await pool.execute('DELETE FROM documents WHERE id = ? AND user_id = ?', [id, req.user.id]);
    await logActivity(req.user.id, 'DELETE', `Deleted document: ${rows[0].name} (ID: ${id})`);
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
});

// --- Administrative Document Access (Admin role restricted) ---

/**
 * GET /api/documents/admin/list
 * Admin list all documents
 */
router.get('/admin/list', requireAdmin, async (_req, res, next) => {
  try {
    const [documents] = await pool.query(
      `SELECT d.*, u.name as user_name, u.email as user_email 
       FROM documents d 
       JOIN users u ON d.user_id = u.id 
       ORDER BY d.id DESC`
    );
    return res.json(documents);
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/documents/admin/:id/rename
 * Admin rename any document
 */
router.patch('/admin/:id/rename', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const [result]: any = await pool.execute('UPDATE documents SET name = ? WHERE id = ?', [name, id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "Document not found" });

    await logActivity(req.user.id, 'ADMIN_RENAME', `Admin renamed document (ID: ${id}) to: ${name}`);
    return res.json({ message: "Document renamed successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/documents/admin/:id
 * Admin delete any document
 */
router.delete('/admin/:id', requireAdmin, async (req: AuthenticatedRequest, res, next) => {
  const { id } = req.params;
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM documents WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: "Document not found" });
    
    if (rows[0].file_path) {
      const filePath = path.join(uploadsDir, rows[0].file_path);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    
    await pool.execute('DELETE FROM documents WHERE id = ?', [id]);
    await logActivity(req.user.id, 'ADMIN_DELETE', `Admin deleted document: ${rows[0].name} (ID: ${id})`);
    return res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/admin/:id/file
 * Admin download any document
 */
router.get('/admin/:id/file', requireAdmin, async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM documents WHERE id = ?', [id]);
    if (!rows.length || !rows[0].file_path) return res.status(404).json({ error: "File not found" });
    
    const filePath = path.join(uploadsDir, rows[0].file_path);
    return res.download(filePath, rows[0].name);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/documents/admin/user/:userId
 * Admin list documents for a specific user
 */
router.get('/admin/user/:userId', requireAdmin, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const [documents] = await pool.query(
      `SELECT * FROM documents WHERE user_id = ? ORDER BY id DESC`,
      [userId]
    );
    return res.json(documents);
  } catch (error) {
    next(error);
  }
});

export default router;
