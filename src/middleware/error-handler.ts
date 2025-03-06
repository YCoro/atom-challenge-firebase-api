import { Request, Response, NextFunction } from 'express';

interface ApiError extends Error {
  statusCode?: number;
  details?: any;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error occurred:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;
  
  res.status(statusCode).json({
    error: {
      message,
      details,
      status: statusCode
    }
  });
};

// Helper function to create custom errors
export const createError = (message: string, statusCode: number, details?: any): ApiError => {
  const error: ApiError = new Error(message);
  error.statusCode = statusCode;
  error.details = details;
  return error;
}; 