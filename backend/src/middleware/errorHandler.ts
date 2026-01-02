import { Request, Response, NextFunction } from 'express';
import { AppError, ValidationError } from '../utils/errors';

/**
 * Enhanced Error Handler
 * Handles both operational (AppError) and programming errors
 */
export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error for debugging
  console.error('Error:', {
    message: error.message,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ...(error instanceof AppError && { code: error.code })
  });

  // Handle known operational errors
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        ...(error instanceof ValidationError && { fields: error.fields })
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle Zod validation errors (if not caught by validate middleware)
  if (error.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const fields: Record<string, string[]> = {};
    Object.keys(error.errors || {}).forEach(key => {
      fields[key] = [error.errors[key].message];
    });
    
    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        fields
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle duplicate key errors (MongoDB)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0];
    return res.status(409).json({
      success: false,
      error: {
        message: `${field} already exists`,
        code: 'DUPLICATE_ENTRY'
      },
      timestamp: new Date().toISOString()
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? 'Internal server error' 
        : error.message,
      code: 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { 
        stack: error.stack,
        details: error 
      })
    },
    timestamp: new Date().toISOString()
  });
};
