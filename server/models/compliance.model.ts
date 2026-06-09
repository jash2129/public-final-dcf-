import { pool } from '../db';
import mysql from 'mysql2/promise';

export interface ComplianceTask {
  id: number;
  title: string;
  dueDate: string; // e.g. "Nov 20, 2026"
  status: 'upcoming' | 'overdue' | 'completed';
  type: string;
  penalty?: string;
  user_id: number;
  service_id?: number;
  created_at?: Date;
}

/**
 * List all compliance tasks for a specific user
 */
export async function listUserComplianceTasks(userId: number): Promise<ComplianceTask[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM compliance_tasks WHERE user_id = ? ORDER BY STR_TO_DATE(dueDate, "%b %d, %Y") ASC, id DESC',
    [userId]
  );
  return rows as ComplianceTask[];
}

/**
 * Get all compliance tasks (Admin view)
 */
export async function listAllComplianceTasks(): Promise<ComplianceTask[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT c.*, u.name as user_name, u.email as user_email FROM compliance_tasks c JOIN users u ON c.user_id = u.id ORDER BY STR_TO_DATE(c.dueDate, "%b %d, %Y") ASC',
    []
  );
  return rows as ComplianceTask[];
}

/**
 * Create a new compliance task entry
 */
export async function createComplianceTask(task: Partial<ComplianceTask>): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO compliance_tasks (title, dueDate, status, type, penalty, user_id, service_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      task.title,
      task.dueDate,
      task.status || 'upcoming',
      task.type || 'Taxation',
      task.penalty || null,
      task.user_id,
      task.service_id || null
    ]
  );
  return (result as any).insertId;
}

/**
 * Find compliance task by ID
 */
export async function findComplianceTaskById(id: number): Promise<ComplianceTask | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM compliance_tasks WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  return rows[0] as ComplianceTask;
}

/**
 * Update compliance task status
 */
export async function updateComplianceTaskStatus(id: number, status: 'upcoming' | 'overdue' | 'completed'): Promise<boolean> {
  const [result] = await pool.execute('UPDATE compliance_tasks SET status = ? WHERE id = ?', [status, id]);
  return (result as any).affectedRows > 0;
}

/**
 * Delete a compliance task
 */
export async function deleteComplianceTask(id: number): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM compliance_tasks WHERE id = ?', [id]);
  return (result as any).affectedRows > 0;
}
