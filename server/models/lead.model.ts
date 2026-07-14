import { pool } from '../db';
import mysql from 'mysql2/promise';

export interface Lead {
  id?: number;
  full_name: string;
  mobile_number: string;
  email_address: string;
  city: string;
  service_name: string;
  sequence_step?: number;
  last_email_sent_at?: Date;
  status?: 'active' | 'unsubscribed' | 'converted';
  created_at?: Date;
  updated_at?: Date;
}

export async function createLead(lead: Lead): Promise<number> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO leads (full_name, mobile_number, email_address, city, service_name, sequence_step, status) 
     VALUES (?, ?, ?, ?, ?, 0, 'active')`,
    [lead.full_name, lead.mobile_number, lead.email_address, lead.city, lead.service_name]
  );
  return result.insertId;
}

export async function getActiveLeadsForFollowUp(): Promise<Lead[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT * FROM leads WHERE status = 'active'`
  );
  return rows as Lead[];
}

export async function updateLeadSequence(id: number, nextStep: number): Promise<void> {
  await pool.execute(
    `UPDATE leads SET sequence_step = ?, last_email_sent_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [nextStep, id]
  );
}

export async function updateLeadStatus(id: number, status: 'unsubscribed' | 'converted'): Promise<void> {
  await pool.execute(
    `UPDATE leads SET status = ? WHERE id = ?`,
    [status, id]
  );
}
