import { pool } from '../db';
import mysql from 'mysql2/promise';

export interface Coupon {
  id: number;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount: number | null;
  min_order_value: number | null;
  valid_until: Date | null;
  usage_limit: number | null;
  times_used: number;
  active: boolean;
}

/**
 * Find a coupon by its code
 */
export async function findCouponByCode(code: string): Promise<Coupon | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM coupons WHERE code = ?',
    [code]
  );
  if (rows.length === 0) return null;
  
  const coupon = rows[0] as Coupon;
  coupon.discount_value = parseFloat(coupon.discount_value as unknown as string);
  if (coupon.max_discount !== null) {
    coupon.max_discount = parseFloat(coupon.max_discount as unknown as string);
  }
  if (coupon.min_order_value !== null) {
    coupon.min_order_value = parseFloat(coupon.min_order_value as unknown as string);
  }
  
  return coupon;
}

/**
 * Validate a coupon and calculate discount amount
 */
export function validateCoupon(coupon: Coupon, baseOrderAmount: number): { isValid: boolean; discountAmount: number; error?: string } {
  if (!coupon.active) {
    return { isValid: false, discountAmount: 0, error: 'This coupon is no longer active.' };
  }

  if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
    return { isValid: false, discountAmount: 0, error: 'This coupon has expired.' };
  }

  if (coupon.usage_limit !== null && coupon.times_used >= coupon.usage_limit) {
    return { isValid: false, discountAmount: 0, error: 'This coupon has reached its usage limit.' };
  }

  if (coupon.min_order_value !== null && baseOrderAmount < coupon.min_order_value) {
    return { isValid: false, discountAmount: 0, error: `Order amount must be at least ₹${coupon.min_order_value} to use this coupon.` };
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = (baseOrderAmount * coupon.discount_value) / 100;
    if (coupon.max_discount !== null && discountAmount > coupon.max_discount) {
      discountAmount = coupon.max_discount;
    }
  } else if (coupon.discount_type === 'fixed') {
    discountAmount = coupon.discount_value;
  }

  // Ensure discount is not greater than the order amount
  if (discountAmount > baseOrderAmount) {
    discountAmount = baseOrderAmount;
  }

  return { isValid: true, discountAmount };
}

/**
 * Increment usage count of a coupon
 */
export async function incrementCouponUsage(code: string): Promise<void> {
  await pool.execute(
    'UPDATE coupons SET times_used = times_used + 1 WHERE code = ?',
    [code]
  );
}

/**
 * Get all coupons (Admin)
 */
export async function getAllCoupons(): Promise<Coupon[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    'SELECT * FROM coupons ORDER BY id DESC'
  );
  
  return rows.map(row => {
    const coupon = row as Coupon;
    coupon.discount_value = parseFloat(coupon.discount_value as unknown as string);
    if (coupon.max_discount !== null) {
      coupon.max_discount = parseFloat(coupon.max_discount as unknown as string);
    }
    if (coupon.min_order_value !== null) {
      coupon.min_order_value = parseFloat(coupon.min_order_value as unknown as string);
    }
    return coupon;
  });
}

/**
 * Create a new coupon (Admin)
 */
export async function createCoupon(coupon: Omit<Coupon, 'id' | 'times_used' | 'active'> & { active?: boolean }): Promise<number> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `INSERT INTO coupons (
      code, discount_type, discount_value, max_discount, 
      min_order_value, valid_until, usage_limit, active
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      coupon.code,
      coupon.discount_type,
      coupon.discount_value,
      coupon.max_discount || null,
      coupon.min_order_value || null,
      coupon.valid_until || null,
      coupon.usage_limit || null,
      coupon.active !== undefined ? coupon.active : true
    ]
  );
  return result.insertId;
}

/**
 * Update an existing coupon (Admin)
 */
export async function updateCoupon(id: number, updates: Partial<Coupon>): Promise<boolean> {
  const fields: string[] = [];
  const values: any[] = [];

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'times_used') continue;
    fields.push(`${key} = ?`);
    values.push(value !== undefined ? value : null);
  }

  if (fields.length === 0) return false;

  values.push(id);
  
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    `UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  return result.affectedRows > 0;
}

/**
 * Delete a coupon (Admin)
 */
export async function deleteCoupon(id: number): Promise<boolean> {
  const [result] = await pool.execute<mysql.ResultSetHeader>(
    'DELETE FROM coupons WHERE id = ?',
    [id]
  );
  return result.affectedRows > 0;
}
