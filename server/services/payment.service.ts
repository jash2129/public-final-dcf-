import Razorpay from 'razorpay';
import crypto from 'crypto';
import * as orderModel from '../models/order.model';
import * as notificationService from './notification.service';

let razorpayInstance: Razorpay | null = null;

function getRazorpay(): Razorpay {
  if (!razorpayInstance) {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials are not fully configured in environment variables.");
    }
    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }
  return razorpayInstance;
}

/**
 * Initiates a payment for a specific order.
 * Resolves the order, validates it, and registers it with Razorpay.
 */
export async function initiatePayment(orderId: string, userId: number) {
  const order = await orderModel.findOrderById(orderId);
  
  if (!order) {
    throw { status: 404, message: `Order with ID ${orderId} not found.` };
  }

  // Validate order ownership
  if (order.user_id !== userId) {
    throw { status: 403, message: 'Forbidden. You do not own this order.' };
  }

  // Validate that the order is not already paid
  if (order.payment_status === 'paid') {
    throw { status: 400, message: 'Order has already been paid.' };
  }

  // Retrieve order items to get the service base price
  const items = await orderModel.getOrderItems(orderId);
  const service = {
    basePrice: order.base_price || (items.length > 0 ? items[0].price_at_purchase : order.total_amount)
  };

  const basePrice = Number(service.basePrice); // Ensure it's handled as a number
  const taxMultiplier = 1.18;
  const totalAmountInPaise = Math.round(basePrice * taxMultiplier * 100);

  try {
    const rpOrder = await getRazorpay().orders.create({
      amount: totalAmountInPaise,
      currency: 'INR',
      receipt: orderId,
    });

    return {
      key: process.env.RAZORPAY_KEY_ID || '',
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      dbOrderId: orderId,
    };
  } catch (error: any) {
    console.error("Razorpay order creation failed:", error);
    throw { status: 500, message: error.message || "Failed to initiate payment with Razorpay." };
  }
}

/**
 * Verifies a Razorpay payment signature.
 * On successful verification, marks the order as paid in the database.
 */
export async function verifyPaymentSignature(
  orderId: string,
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): Promise<boolean> {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) {
    console.error("RAZORPAY_KEY_SECRET is not configured.");
    return false;
  }

  const text = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(text)
    .digest('hex');

  const isAuthentic = crypto.timingSafeEqual(
    Buffer.from(expectedSignature, 'utf-8'),
    Buffer.from(razorpaySignature, 'utf-8')
  );

  if (isAuthentic) {
    const success = await orderModel.markOrderAsPaid(
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (success) {
      Promise.all([
        orderModel.findOrderById(orderId),
        orderModel.getOrderItems(orderId)
      ])
        .then(([order, items]) => {
          if (order) {
            const serviceName = items.length > 0
              ? items.map(i => i.service_name).filter(Boolean).join(', ')
              : 'General Filing Services';

            notificationService.notifyPaymentSuccess(
              order.id,
              order.total_amount,
              order.user_email || '',
              order.user_name || '',
              order.user_id,
              serviceName
            ).catch(err => {
              console.error("Failed to send payment success email:", err);
            });
          }
        })
        .catch(err => {
          console.error("Failed to fetch details for success email:", err);
        });
    }

    return success;
  }

  console.warn(`Signature verification failed for order ${orderId}. Expected ${expectedSignature}, got ${razorpaySignature}`);
  return false;
}

/**
 * Processes a Razorpay Webhook notification.
 * Verifies signature, guards against duplicate processing, and marks orders as paid.
 */
export async function processWebhook(
  rawBody: string,
  signature: string,
  payload: any
): Promise<boolean> {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');

  if (expectedSignature !== signature) {
    throw new Error("Invalid Webhook Signature");
  }

  if (payload.event !== 'payment.captured') {
    return true;
  }

  const rzpOrderId = payload.payload.payment.entity.order_id;
  const rzpPaymentId = payload.payload.payment.entity.id;
  const dbOrderId = payload.payload.payment.entity.receipt;

  const order = await orderModel.findOrderById(dbOrderId);
  if (!order) {
    throw new Error(`Order with ID ${dbOrderId} not found.`);
  }

  // Idempotency Guard
  if (order.payment_status === 'paid') {
    return true;
  }

  await orderModel.markOrderAsPaid(dbOrderId, rzpOrderId, rzpPaymentId, 'webhook_verified');

  const items = await orderModel.getOrderItems(dbOrderId);
  const serviceName = items.length > 0
    ? items.map(i => i.service_name).filter(Boolean).join(', ')
    : 'General Filing Services';

  // Async notification - non-blocking
  notificationService.notifyPaymentSuccess(
    order.id,
    order.total_amount,
    order.user_email || '',
    order.user_name || '',
    order.user_id,
    serviceName
  ).catch(err => {
    console.error("Failed to send webhook payment success email:", err);
  });

  return true;
}

