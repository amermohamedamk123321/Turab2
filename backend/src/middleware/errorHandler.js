/**
 * Global error handler middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  console.error('[ERROR]', {
    message: err.message,
    status: err.status || 500,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  // Validation errors
  if (err.status === 400 && err.errors) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors,
    });
  }

  // Authentication errors
  if (err.status === 401) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized',
    });
  }

  // Forbidden errors
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden',
    });
  }

  // Not found errors
  if (err.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Not found',
    });
  }

  // Generic error response
  res.status(status).json({
    success: false,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async wrapper to handle errors in async route handlers
 * Usage: router.get('/path', asyncHandler(async (req, res) => {...}))
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.status = status;
  }
}
