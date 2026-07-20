import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'deccan-filings-secret-key-123';
const JWT_EXPIRES_IN = '1h';

export interface UserTokenPayload {
  id: number;
  email: string;
  phone?: string;
  role: 'user' | 'admin' | 'super_admin';
}

/**
 * Hash password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare plain text password with hashed password
 */
export async function comparePassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed);
}

/**
 * Generate JWT token for user payload
 */
export function generateToken(payload: UserTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token and decode payload
 */
export function verifyToken(token: string): UserTokenPayload {
  return jwt.verify(token, JWT_SECRET) as UserTokenPayload;
}
