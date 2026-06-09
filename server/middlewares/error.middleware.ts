import { Request, Response, NextFunction } from 'express';

/**
 * Express error-handling middleware. Logs stack-traces and formats a unified JSON response.
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error("Express Error Handler caught exception:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    success: false,
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
