import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function createError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const isProduction = process.env.NODE_ENV === 'production';

  if (statusCode >= 500) {
    console.error('[Error]', err);
  } else {
    console.warn('[Error]', err.message);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: isProduction && statusCode >= 500 ? 'Internal server error' : err.message,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
}
