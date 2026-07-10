import { pool } from '../db';
import mysql from 'mysql2/promise';
import { formatPhoneWithCountryCode } from '../utils/helpers';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: 'user' | 'admin' | 'super_admin';
  avatar?: string;
  phone?: string;
  whatsapp_number?: string;
  company_name?: string;
  address?: string;
  gstin?: string;
  notification_prefs?: string;
  created_at?: Date;
  reset_password_token?: string;
  reset_password_expires?: Date;
}

/**
 * Find user by email
 */
export async function findUserByEmail(email: string): Promise<User | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  if (rows.length === 0) return null;
  return rows[0] as User;
}

/**
 * Find user by ID
 */
export async function findUserById(id: number): Promise<User | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT id, name, email, role, phone, whatsapp_number, avatar, company_name, address, gstin, notification_prefs, created_at FROM users WHERE id = ?',
    [id]
  );
  if (rows.length === 0) return null;
  return rows[0] as User;
}

/**
 * Create a new user
 */
export async function createUser(user: Partial<User>): Promise<number> {
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password, role, avatar, phone, whatsapp_number, company_name, address, gstin, notification_prefs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [
      user.name ?? null,
      user.email ?? null,
      user.password ?? null,
      user.role || 'user',
      user.avatar ?? null,
      formatPhoneWithCountryCode(user.phone) ?? null,
      formatPhoneWithCountryCode(user.whatsapp_number) ?? null,
      user.company_name ?? null,
      user.address ?? null,
      user.gstin ?? null,
      user.notification_prefs ?? JSON.stringify({ email: true, sms: false })
    ]
  );
  return (result as any).insertId;
}

/**
 * Find user by WhatsApp number
 */
export async function findUserByWhatsappNumber(whatsappNumber: string): Promise<User | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM users WHERE whatsapp_number = ?', [whatsappNumber]);
  if (rows.length === 0) return null;
  return rows[0] as User;
}

/**
 * Update user profile
 */
export async function updateUserProfile(id: number, profile: Partial<User>): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE users SET name = ?, email = ?, phone = ?, company_name = ?, address = ?, gstin = ? WHERE id = ?',
    [
      profile.name ?? null,
      profile.email ?? null,
      formatPhoneWithCountryCode(profile.phone) ?? null,
      profile.company_name ?? null,
      profile.address ?? null,
      profile.gstin ?? null,
      id
    ]
  );
  return (result as any).affectedRows > 0;
}

/**
 * Update user password
 */
export async function updateUserPassword(id: number, passwordHash: string): Promise<boolean> {
  const [result] = await pool.execute('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
  return (result as any).affectedRows > 0;
}

/**
 * Update user avatar
 */
export async function updateUserAvatar(id: number, avatarUrl: string): Promise<boolean> {
  const [result] = await pool.execute('UPDATE users SET avatar = ? WHERE id = ?', [avatarUrl, id]);
  return (result as any).affectedRows > 0;
}

/**
 * Update notification preferences
 */
export async function updateNotificationPrefs(id: number, prefsJson: string): Promise<boolean> {
  const [result] = await pool.execute('UPDATE users SET notification_prefs = ? WHERE id = ?', [prefsJson, id]);
  return (result as any).affectedRows > 0;
}

/**
 * Get all users (Super Admin dashboard view)
 */
export async function listAllUsers(): Promise<User[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT id, name, email, role, whatsapp_number, created_at FROM users ORDER BY id ASC');
  return rows as User[];
}

/**
 * Update user role (Super Admin only, role cannot be super_admin)
 */
export async function updateUserRole(id: number, role: 'user' | 'admin'): Promise<boolean> {
  const [result] = await pool.execute('UPDATE users SET role = ? WHERE id = ? AND role != "super_admin"', [role, id]);
  return (result as any).affectedRows > 0;
}

/**
 * Save password reset token for a user
 */
export async function savePasswordResetToken(email: string, token: string, expiresAt: Date): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE email = ?',
    [token, expiresAt, email]
  );
  return (result as any).affectedRows > 0;
}

/**
 * Find user by reset token that is not expired
 */
export async function findUserByResetToken(token: string): Promise<User | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM users WHERE reset_password_token = ? AND reset_password_expires > NOW()',
    [token]
  );
  if (rows.length === 0) return null;
  return rows[0] as User;
}

