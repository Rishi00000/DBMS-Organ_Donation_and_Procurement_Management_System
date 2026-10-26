// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // PostgreSQL specific errors
  if (err.code) {
    switch (err.code) {
      case '23505': // Unique violation
        return res.status(409).json({
          error: 'Duplicate entry',
          message: 'A record with this information already exists',
          detail: err.detail,
        });
      
      case '23503': // Foreign key violation
        return res.status(400).json({
          error: 'Invalid reference',
          message: 'Referenced record does not exist',
          detail: err.detail,
        });
      
      case '23502': // Not null violation
        return res.status(400).json({
          error: 'Missing required field',
          message: 'A required field is missing',
          detail: err.detail,
        });
      
      case '23514': // Check constraint violation
        // Provide more specific message for common constraint violations
        if (err.detail && err.detail.includes('chk_expiry_after_procurement')) {
          return res.status(400).json({
            error: 'Invalid expiry time',
            message: 'Expiry time must be after procurement date',
            detail: err.detail,
          });
        }
        return res.status(400).json({
          error: 'Invalid data',
          message: 'Data does not meet requirements',
          detail: err.detail,
        });
      
      default:
        return res.status(500).json({
          error: 'Database error',
          message: err.message || 'An error occurred while processing your request',
          code: err.code,
          detail: process.env.NODE_ENV === 'development' ? err.detail : undefined,
        });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token',
      message: 'The provided token is invalid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Token expired',
      message: 'Your session has expired. Please login again.',
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    error: err.name || 'Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 Not Found handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
};

// Async error wrapper
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
