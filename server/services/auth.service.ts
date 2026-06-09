import * as userModel from '../models/user.model';
import { hashPassword, comparePassword, generateToken } from '../utils/security';

export interface AuthResult {
  user: {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'admin' | 'super_admin';
    phone?: string;
    company_name?: string;
  };
  token: string;
}

/**
 * Register a new user account
 */
export async function register(userData: any): Promise<AuthResult> {
  const existingUser = await userModel.findUserByEmail(userData.email);
  if (existingUser) {
    throw { status: 400, message: 'Email address is already in use' };
  }

  const hashedPassword = await hashPassword(userData.password);
  
  const userId = await userModel.createUser({
    name: userData.name,
    email: userData.email,
    password: hashedPassword,
    role: 'user', // Default register role is user
    phone: userData.phone || null,
    company_name: userData.companyName || null,
    address: userData.address || null,
    gstin: userData.gstin || null
  });

  const user = await userModel.findUserById(userId);
  if (!user) {
    throw { status: 500, message: 'Failed to retrieve created user profile' };
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
