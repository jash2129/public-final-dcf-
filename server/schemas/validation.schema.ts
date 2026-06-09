/**
 * Input Validation Schemas for Deccan Filings
 */

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate registration input
 */
export function validateRegister(body: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
  }
  
  if (!body.email || typeof body.email !== 'string' || !validateEmail(body.email)) {
    errors.email = 'A valid email address is required';
  }
  
  if (!body.password || typeof body.password !== 'string' || body.password.length < 6) {
    errors.password = 'Password must be at least 6 characters long';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate login input
 */
export function validateLogin(body: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!body.email || typeof body.email !== 'string' || !validateEmail(body.email)) {
    errors.email = 'A valid email address is required';
  }
  
  if (!body.password || typeof body.password !== 'string') {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate order placement input
 */
export function validateOrder(body: any): ValidationResult {
  const errors: Record<string, string> = {};
  
  // Accept both serviceId (numeric or code like START001) or service (string name for legacy)
  if (!body.serviceId && !body.service) {
    errors.service = 'Service ID or Service name is required';
  }
  
  if (body.quantity !== undefined && (typeof body.quantity !== 'number' || body.quantity <= 0)) {
    errors.quantity = 'Quantity must be a positive integer';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate service management inputs (Creation/Update)
 */
export function validateService(body: any, isUpdate = false): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!isUpdate) {
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length === 0) {
      errors.name = 'Service name is required';
    }
    if (!body.category || typeof body.category !== 'string' || body.category.trim().length === 0) {
      errors.category = 'Category is required';
    }
    if (body.price === undefined || isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0) {
      errors.price = 'Price is required and must be a non-negative number';
    }
  } else {
    if (body.name !== undefined && (typeof body.name !== 'string' || body.name.trim().length === 0)) {
      errors.name = 'Service name cannot be empty';
    }
    if (body.category !== undefined && (typeof body.category !== 'string' || body.category.trim().length === 0)) {
      errors.category = 'Category cannot be empty';
    }
    if (body.price !== undefined && (isNaN(parseFloat(body.price)) || parseFloat(body.price) < 0)) {
      errors.price = 'Price must be a non-negative number';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate order status flow transitions
 */
const VALID_STATUSES = ['placed', 'in_progress', 'completed', 'rejected'];

export function validateOrderStatus(status: string): ValidationResult {
  const errors: Record<string, string> = {};
  const normalized = status ? status.toLowerCase() : '';
  
  if (!VALID_STATUSES.includes(normalized)) {
    errors.status = `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
