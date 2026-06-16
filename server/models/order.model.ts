import { pool } from '../db';
import mysql from 'mysql2/promise';

export interface Order {
  id: string;
  user_id: number;
  status: 'placed' | 'in_progress' | 'completed' | 'rejected';
  total_amount: number;
  payment_status?: 'pending' | 'paid' | 'failed';
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
  created_at?: Date;
  // Joined fields for administrative views
  user_name?: string;
  user_email?: string;
  service_names?: string; // compiled string of service names in order
}

export interface OrderItem {
  id?: number;
  order_id: string;
  service_id: number;
  price_at_purchase: number;
  quantity: number;
  service_name?: string;
  service_code?: string;
}

/**
 * Creates an order and its items in a single atomic database transaction.
 * Implements SQL transaction row locking for safe concurrent sequential ID generation.
 */
export async function createOrderWithItems(
  userId: number,
  items: { serviceId: number; priceAtPurchase: number; quantity: number }[]
): Promise<string> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Generate concurrency-safe sequential human-readable Order ID: DCF-YYYYMMDD-XXXX
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`; // YYYYMMDD
    const orderIdLike = `DCF-${datePrefix}-%`;

    // Acquire lock using FOR UPDATE to prevent concurrent reads from matching the same latest order
    const [latestRows] = await connection.query<mysql.RowDataPacket[]>(
      'SELECT id FROM orders WHERE id LIKE ? ORDER BY id DESC LIMIT 1 FOR UPDATE',
      [orderIdLike]
    );

    let nextIndex = 1;
    if (latestRows.length > 0) {
      const latestId = latestRows[0].id; // DCF-YYYYMMDD-XXXX
      const parts = latestId.split('-');
      const currentIndexStr = parts[parts.length - 1];
      const currentIndex = parseInt(currentIndexStr, 10);
      if (!isNaN(currentIndex)) {
        nextIndex = currentIndex + 1;
      }
    }
    const suffix = String(nextIndex).padStart(4, '0'); // pad to 4 digits: 0001
    const orderId = `DCF-${datePrefix}-${suffix}`;

    // 2. Calculate total order amount
    let totalAmount = 0;
    for (const item of items) {
      totalAmount += item.priceAtPurchase * item.quantity;
    }

    // 3. Insert order record
    await connection.execute(
      'INSERT INTO orders (id, user_id, status, total_amount) VALUES (?, ?, ?, ?)',
      [orderId, userId, 'placed', totalAmount]
    );

    // 4. Insert order items
    for (const item of items) {
      await connection.execute(
        'INSERT INTO order_items (order_id, service_id, price_at_purchase, quantity) VALUES (?, ?, ?, ?)',
        [orderId, item.serviceId, item.priceAtPurchase, item.quantity]
      );
    }

    await connection.commit();
    return orderId;
  } catch (error) {
    await connection.rollback();
    console.error("Failed to execute order placement transaction:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Find order details by order_id
 */
export async function findOrderById(orderId: string): Promise<Order | null> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT o.*, u.name as user_name, u.email as user_email 
     FROM orders o 
     JOIN users u ON o.user_id = u.id 
     WHERE o.id = ?`,
    [orderId]
  );
  if (rows.length === 0) return null;
  
  const order = rows[0];
  order.total_amount = parseFloat(order.total_amount);
  return order as Order;
}

/**
 * Fetch all items associated with an order
 */
export async function getOrderItems(orderId: string): Promise<OrderItem[]> {
  const [rows] = await pool.query<mysql.RowDataPacket[]>(
    `SELECT oi.*, s.name as service_name, s.code as service_code 
     FROM order_items oi 
     JOIN services s ON oi.service_id = s.id 
     WHERE oi.order_id = ?`,
    [orderId]
  );
  return rows.map(r => ({ ...r, price_at_purchase: parseFloat(r.price_at_purchase) })) as OrderItem[];
}

/**
 * Get all orders placed by a specific user (User dashboard view)
 */
export async function listUserOrders(userId: number, startDate?: string, endDate?: string): Promise<Order[]> {
  let sql = `
    SELECT o.*, 
      (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') 
       FROM order_items oi 
       JOIN services s ON oi.service_id = s.id 
       WHERE oi.order_id = o.id) as service_names
    FROM orders o
    WHERE o.user_id = ?
  `;
  const params: any[] = [userId];

  if (startDate && endDate) {
    sql += ' AND o.created_at >= ? AND o.created_at <= ?';
    params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  }

  sql += ' ORDER BY o.created_at DESC';
  const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, params);
  
  return rows.map(r => ({ ...r, total_amount: parseFloat(r.total_amount) })) as Order[];
}

/**
 * Get all orders across the client base (Admin dashboard view)
 */
export async function listAllOrders(startDate?: string, endDate?: string): Promise<Order[]> {
  let sql = `
    SELECT o.*, u.name as user_name, u.email as user_email,
      (SELECT GROUP_CONCAT(s.name SEPARATOR ', ') 
       FROM order_items oi 
       JOIN services s ON oi.service_id = s.id 
       WHERE oi.order_id = o.id) as service_names
    FROM orders o
    JOIN users u ON o.user_id = u.id
  `;
  const params: any[] = [];

  if (startDate && endDate) {
    sql += ' WHERE o.created_at >= ? AND o.created_at <= ?';
    params.push(`${startDate} 00:00:00`, `${endDate} 23:59:59`);
  }

  sql += ' ORDER BY o.created_at DESC';
  const [rows] = await pool.query<mysql.RowDataPacket[]>(sql, params);
  
  return rows.map(r => ({ ...r, total_amount: parseFloat(r.total_amount) })) as Order[];
}

/**
 * Update order status (Admin only)
 */
export async function updateOrderStatus(orderId: string, status: string): Promise<boolean> {
  const [result] = await pool.execute('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
  return (result as any).affectedRows > 0;
}

/**
 * Update order total amount and its items' pricing (Admin only)
 */
export async function updateOrderAmountAndItems(orderId: string, amount: number): Promise<boolean> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    // Update orders table
    const [orderResult] = await connection.execute(
      'UPDATE orders SET total_amount = ? WHERE id = ?',
      [amount, orderId]
    );

    // Update order_items table for this order
    await connection.execute(
      'UPDATE order_items SET price_at_purchase = ? WHERE order_id = ?',
      [amount, orderId]
    );

    await connection.commit();
    return (orderResult as any).affectedRows > 0;
  } catch (error) {
    await connection.rollback();
    console.error("Failed to update order amount and items:", error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Delete order record (Admin only)
 */
export async function deleteOrderRecord(orderId: string): Promise<boolean> {
  const [result] = await pool.execute('DELETE FROM orders WHERE id = ?', [orderId]);
  return (result as any).affectedRows > 0;
}

/**
 * Mark order as paid and update its status to in_progress
 */
export async function markOrderAsPaid(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string
): Promise<boolean> {
  const [result] = await pool.execute(
    `UPDATE orders 
     SET status = 'in_progress', 
         payment_status = 'paid', 
         razorpay_order_id = ?, 
         razorpay_payment_id = ?, 
         razorpay_signature = ? 
     WHERE id = ?`,
    [razorpayOrderId, razorpayPaymentId, signature, orderId]
  );
  return (result as any).affectedRows > 0;
}
