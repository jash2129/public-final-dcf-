import { pool } from '../db';
import mysql from 'mysql2/promise';

export interface Service {
  id: number;
  code: string;
  name: string;
  slug: string;
  category: string;
  description?: string;
  price: number;
  mode?: string;
  turnaround_time?: string;
  is_recurring?: string;
  compliance_type?: string;
  recurring_frequency?: string;
  standard_due_rule?: string;
  reminder_offsets?: string;
  documents_required?: string;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * List all services in the catalog
 */
export async function listAllServices(): Promise<Service[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM services ORDER BY category ASC, name ASC');
  // Map Decimal strings back to floats
  return rows.map(r => ({ ...r, price: parseFloat(r.price) })) as Service[];
}

/**
 * Find service by ID
 */
export async function findServiceById(id: number): Promise<Service | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM services WHERE id = ?', [id]);
  if (rows.length === 0) return null;
  const res = rows[0];
  res.price = parseFloat(res.price);
  return res as Service;
}

/**
 * Find service by code (e.g. START001)
 */
export async function findServiceByCode(code: string): Promise<Service | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM services WHERE code = ?', [code]);
  if (rows.length === 0) return null;
  const res = rows[0];
  res.price = parseFloat(res.price);
  return res as Service;
}

/**
 * Find service by Name (for legacy backend API support)
 */
export async function findServiceByName(name: string): Promise<Service | null> {
  // Case-insensitive lookup
  const [rows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM services WHERE LOWER(name) = LOWER(?)', [name.trim()]);
  if (rows.length > 0) {
    const res = rows[0];
    res.price = parseFloat(res.price);
    return res as Service;
  }

  // 2. Try normalized name lookup (if we normalize the search term and database terms)
  const [allRows] = await pool.query<mysql.RowDataPacket[]>('SELECT * FROM services');
  
  const normalize = (s: string) => s.toLowerCase()
    .replace(/ registration/g, '')
    .replace(/ certification/g, '')
    .replace(/ certificate/g, '')
    .replace(/ services/g, '')
    .replace(/ service/g, '')
    .replace(/ setup/g, '')
    .replace(/ & /g, ' and ')
    .replace(/ and /g, ' & ')
    .replace(/ firm/g, '')
    .replace(/ company/g, '')
    .replace(/ limited/g, '')
    .replace(/ incorporation/g, '')
    .replace(/ filing/g, '')
    .replace(/ filings/g, '')
    .replace(/ - /g, ' ')
    .replace(/-/g, ' ')
    .replace(/\(.*\)/g, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const normTarget = normalize(name);
  for (const row of allRows) {
    const normRow = normalize(row.name);
    if (normRow === normTarget || normRow.includes(normTarget) || normTarget.includes(normRow)) {
      row.price = parseFloat(row.price);
      return row as Service;
    }
  }

  return null;
}

/**
 * Create a new service record (Admin only)
 */
export async function createService(service: Partial<Service>): Promise<number> {
  const [result] = await pool.execute(
    `INSERT INTO services (code, name, slug, category, description, price, mode, turnaround_time, is_recurring, compliance_type, recurring_frequency, standard_due_rule, reminder_offsets, documents_required)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      service.code,
      service.name,
      service.slug,
      service.category,
      service.description || null,
      service.price,
      service.mode || 'Online',
      service.turnaround_time || '3-5 days',
      service.is_recurring || 'No',
      service.compliance_type || null,
      service.recurring_frequency || null,
      service.standard_due_rule || 'No statutory deadline',
      service.reminder_offsets || '7,3,1 days',
      service.documents_required || null
    ]
  );
  return (result as any).insertId;
}

/**
 * Update service details and/or pricing (Admin only)
 */
export async function updateService(id: number, service: Partial<Service>): Promise<boolean> {
  const [result] = await pool.execute(
    'UPDATE services SET name = COALESCE(?, name), category = COALESCE(?, category), description = COALESCE(?, description), price = COALESCE(?, price), standard_due_rule = COALESCE(?, standard_due_rule) WHERE id = ?',
    [
      service.name !== undefined ? service.name : null,
      service.category !== undefined ? service.category : null,
      service.description !== undefined ? service.description : null,
      service.price !== undefined ? service.price : null,
      service.standard_due_rule !== undefined ? service.standard_due_rule : null,
      id
    ]
  );
  return (result as any).affectedRows > 0;
}
