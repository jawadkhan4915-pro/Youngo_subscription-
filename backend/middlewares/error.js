// Custom Error Response Class
export class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Global Error Handler Middleware
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message || 'Server Error';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    message = 'Duplicate field value entered';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors || {}).map((val) => val.message).join(', ');
    statusCode = 400;
  }

  // JWT expired error
  if (err.name === 'TokenExpiredError') {
    message = 'JWT token expired';
    statusCode = 401;
  }

  // JWT signature error
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid JWT token';
    statusCode = 401;
  }

  // Only print console stack trace for actual 500 Internal Server Errors
  if (statusCode === 500) {
    console.error('[500 Server Error]', err);
  }

  res.status(statusCode).json({
    success: false,
    error: message
  });
};

// Async Handler helper to avoid try-catch blocks in controllers
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
