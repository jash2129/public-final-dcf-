import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserTokenPayload } from '../utils/security';

export interface AuthenticatedRequest extends Request {
  user?: UserTokenPayload;
}

/**
 * Authentication middleware that verifies the incoming JWT in the Authorization header.
 * Rejects with 401 Unauthorized if invalid or missing.
 */
export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Access denied. Malformed token.' });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Role authorization guard middleware. Rejects with 403 Forbidden if user's role is not authorized.
 */
export function requireRole(allowedRoles: ('user' | 'admin' | 'super_admin')[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const hasRole = allowedRoles.includes(req.user.role);
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden. You do not have permission to access this resource.' });
    }

    next();
  };
}

/**
 * Convenience middleware to require admin or super_admin status.
 */
export const requireAdmin = requireRole(['admin', 'super_admin']);

/**
 * Convenience middleware to require super_admin status.
 */
export const requireSuperAdmin = requireRole(['super_admin']);
