import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (err: any, _req: Request, res: Response, _next: NextFunction): void => {
  // Log error for debugging in non-production environments
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  if (err.name === 'NotFoundError' || err.status === 404) {
    res.status(404).json({ error: 'Resource not found' });
    return;
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : err.message || 'Internal server error';

  res.status(statusCode).json({ error: message });
}; 