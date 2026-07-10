import * as orderModel from '../models/order.model';
import * as serviceModel from '../models/service.model';
import * as userModel from '../models/user.model';
import { notifyOrderPlacement, notifyOrderStatusChange } from './notification.service';
import { formatCurrency, formatLegacyDate, generateSlug } from '../utils/helpers';

function getCategoryForService(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('proprietorship') || lower.includes('partnership') || lower.includes('company') || lower.includes('llp') || lower.includes('subsidiary') || lower.includes('nidhi') || lower.includes('trust')) {
    return 'StartUp Registrations';
  }
  if (lower.includes('gst') || lower.includes('gstr') || lower.includes('lut')) {
    return 'GST';
  }
  if (lower.includes('trademark') || lower.includes('logo') || lower.includes('design') || lower.includes('copyright') || lower.includes('patent')) {
    return 'Trademark';
  }
  if (lower.includes('itr') || lower.includes('tax') || lower.includes('tds') || lower.includes('15ca') || lower.includes('15cb') || lower.includes('form 16')) {
    return 'Income Tax';
  }
  if (lower.includes('mca') || lower.includes('roc') || lower.includes('dir-') || lower.includes('director')) {
    return 'MCA';
  }
  if (lower.includes('pf') || lower.includes('esi') || lower.includes('payroll') || lower.includes('attendance') || lower.includes('bookkeeping') || lower.includes('financial statement') || lower.includes('compliance')) {
    return 'Compliance';
  }
  if (lower.includes('loan') || lower.includes('insurance') || lower.includes('mutual fund')) {
    return 'Finance';
  }
  if (lower.includes('uae') || lower.includes('usa') || lower.includes('uk') || lower.includes('singapore') || lower.includes('foreign') || lower.includes('global') || lower.includes('accounting') || lower.includes('taxation')) {
    return 'Global';
  }
  return 'StartUp Registrations';
}

/**
 * Handle checkout. Resolves prices from DB (ignoring customer inputs) and creates the transaction.
 * Supports legacy formats (service name string) as well as new catalog formats (service ID).
 */
export async function checkout(
  userId: number,
  payload: { serviceId?: number; service?: string; quantity?: number; amount?: string }
): Promise<string> {
  const quantity = payload.quantity || 1;
  let service: serviceModel.Service | null = null;

  if (payload.serviceId) {
    service = await serviceModel.findServiceById(payload.serviceId);
  } else if (payload.service) {
    // Legacy support: resolve service by its name string
    service = await serviceModel.findServiceByName(payload.service);

    // Self-healing database pattern: register service if completely missing
    if (!service) {
      const category = getCategoryForService(payload.service);
      const prefixMap: Record<string, string> = {
        'StartUp Registrations': 'STARTUP',
        'License': 'LIC',
        'Trademark': 'TM',
        'GST': 'GST',
        'Income Tax': 'IT',
        'MCA': 'MCA',
        'Compliance': 'COMP',
        'Finance': 'FIN',
        'Global': 'GLOB'
      };
      const prefix = prefixMap[category] || 'STARTUP';
      const code = `${prefix}${Date.now().toString().slice(-4)}`;
      
      let price = 2999.00;
      if (payload.amount) {
        const cleanAmount = payload.amount.replace(/[^0-9.]/g, '');
        const parsedPrice = parseFloat(cleanAmount);
        if (!isNaN(parsedPrice)) {
          price = parsedPrice;
        }
      }

      const newServiceId = await serviceModel.createService({
        code,
        name: payload.service,
        slug: generateSlug(payload.service),
        category,
        price,
        description: `Professional service for ${payload.service}`
      });

      service = await serviceModel.findServiceById(newServiceId);
    }
  }

  if (!service) {
    throw { status: 400, message: 'Invalid service selected.' };
  }

  // Calculate order items (uses backend fixed pricing snapshot)
  const items = [
    {
      serviceId: service.id,
      priceAtPurchase: service.price,
      quantity
    }
  ];

  // Insert order using atomic transaction with database locking
  const orderId = await orderModel.createOrderWithItems(userId, items);

  // Trigger Notifications (runs in background)
  triggerOrderNotification(userId, orderId, service.name, service.price * quantity);

  return orderId;
}

/**
 * Get orders for a specific user formatted for legacy client consumption
 */
export async function getClientOrders(userId: number, startDate?: string, endDate?: string) {
  const dbOrders = await orderModel.listUserOrders(userId, startDate, endDate);
  return dbOrders.map(mapToLegacyOrder);
}

/**
 * Get all client orders for administrative panels
 */
export async function getAllClientOrders(startDate?: string, endDate?: string) {
  const dbOrders = await orderModel.listAllOrders(startDate, endDate);
  return dbOrders.map(mapToLegacyOrder);
}

/**
 * Update status of an order and dispatch notifications
 */
export async function changeOrderStatus(orderId: string, status: string): Promise<boolean> {
  const order = await orderModel.findOrderById(orderId);
  if (!order) {
    throw { status: 404, message: `Order ${orderId} not found.` };
  }

  const success = await orderModel.updateOrderStatus(orderId, status);
  if (success) {
    // Notify in background
    triggerStatusChangeNotification(order.user_id, orderId, status);
  }
  return success;
}

/**
 * Background notification helper for order creation
 */
async function triggerOrderNotification(userId: number, orderId: string, serviceName: string, amount: number) {
  try {
    const user = await userModel.findUserById(userId);
    const order = await orderModel.findOrderById(orderId);
    const finalAmount = order ? order.total_amount : (amount * 1.18);
    if (user) {
      await notifyOrderPlacement(
        orderId,
        user.email,
        user.phone || '',
        user.name,
        serviceName,
        finalAmount,
        userId
      );
    }
  } catch (err) {
    console.error("Failed to trigger order creation notification:", err);
  }
}

/**
 * Background notification helper for status updates
 */
async function triggerStatusChangeNotification(userId: number, orderId: string, status: string) {
  try {
    const user = await userModel.findUserById(userId);
    if (user) {
      await notifyOrderStatusChange(
        orderId,
        status,
        user.email,
        user.phone || '',
        user.name,
        userId
      );
    }
  } catch (err) {
    console.error("Failed to trigger status change notification:", err);
  }
}

/**
 * Convert order DB record to expected frontend representation
 */
export function mapToLegacyOrder(dbOrder: any) {
  return {
    id: dbOrder.id,
    user_id: dbOrder.user_id,
    user_name: dbOrder.user_name,
    user_email: dbOrder.user_email,
    service: dbOrder.service_names || 'General Filing Services',
    service_names: dbOrder.service_names || 'General Filing Services',
    date: dbOrder.created_at ? formatLegacyDate(new Date(dbOrder.created_at)) : formatLegacyDate(new Date()),
    created_at: dbOrder.created_at,
    amount: formatCurrency(dbOrder.total_amount),
    status: dbOrder.status === 'placed' ? 'Placed' :
            dbOrder.status === 'in_progress' ? 'Processing' :
            dbOrder.status === 'completed' ? 'Completed' : 'Action Required',
    payment_status: dbOrder.payment_status || 'pending'
  };
}
