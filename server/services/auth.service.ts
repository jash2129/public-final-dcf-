import * as userModel from '../models/user.model';
import { hashPassword, comparePassword, generateToken } from '../utils/security';
import { formatPhoneWithCountryCode } from '../utils/helpers';

export interface AuthResult {
  user: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    phone?: string;
    whatsapp_number?: string;
    company_name?: string;
  };
  token: string;
}

/**
 * Sync contact to CRM
 */
export async function syncContactToCRM(user: any) {
  try {
    const webhookUrl = process.env.CRM_WEBHOOK_URL || 'http://localhost:3000/api/webhooks/contacts';
    const webhookSecret = process.env.WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Missing WEBHOOK_SECRET. CRM sync skipped.');
      return;
    }

    const payload = {
      name: user.name,
      phone: formatPhoneWithCountryCode(user.phone || user.whatsapp_number) || (user.phone || user.whatsapp_number),
      email: user.email,
      company: user.company_name
    };

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`CRM sync failed with status: ${response.status}`);
    }
  } catch (err) {
    console.error('Error syncing contact to CRM:', err);
  }
}

/**
 * Register a new user account
 */
export async function register(userData: any): Promise<AuthResult> {
  const existingUser = await userModel.findUserByEmail(userData.email);
  if (existingUser) {
    throw { status: 400, message: 'Email address is already in use' };
  }

  const formattedWhatsapp = formatPhoneWithCountryCode(userData.whatsapp_number);
  if (formattedWhatsapp) {
    const existingWhatsapp = await userModel.findUserByWhatsappNumber(formattedWhatsapp);
    if (existingWhatsapp) {
      throw { status: 400, message: 'WhatsApp number is already in use' };
    }
  }

  const hashedPassword = await hashPassword(userData.password);
  
  const userId = await userModel.createUser({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: 'user', // Default register role is user
    // User enters one number (Mobile / WhatsApp). We store it in both columns
    // so all code paths (JWT phone, notifications, order guard) work without friction.
    phone: userData.whatsapp_number || userData.phone || null,
    whatsapp_number: userData.whatsapp_number || userData.phone || null,
    company_name: userData.companyName || null,
    address: userData.address || null,
    gstin: userData.gstin || null
  });

  const user = await userModel.findUserById(userId);
  if (!user) {
    throw { status: 500, message: 'Failed to retrieve created user profile' };
  }

  // Sync to CRM but don't block registration on failure
  try {
    await syncContactToCRM(user);
  } catch (crmError) {
    console.error('Unhandled CRM sync error:', crmError);
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      whatsapp_number: user.whatsapp_number,
      company_name: user.company_name
    },
    token
  };
}

/**
 * Log in a user with email and password credentials
 */
export async function login(credentials: any): Promise<AuthResult> {
  const user = await userModel.findUserByEmail(credentials.email);
  if (!user || !user.password) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const passwordMatch = await comparePassword(credentials.password, user.password);
  if (!passwordMatch) {
    throw { status: 401, message: 'Invalid email or password' };
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      company_name: user.company_name
    },
    token
  };
}
