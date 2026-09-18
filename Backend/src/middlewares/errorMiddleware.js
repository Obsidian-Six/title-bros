/**
 * ==============================================================================
 * Global Error Handling Middlewares
 * ==============================================================================
 * Catches all unhandled routes (404) and exceptions thrown throughout the
 * Express request lifecycle, standardizing error JSON outputs for clients.
 */

import ApiError from '../utils/ApiError.js';

/**
 * 404 Not Found Catch-All Middleware
 */
export const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Cannot ${req.method} ${req.originalUrl} - Endpoint Not Found`));
};

/**
 * Centralized Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // If not already an ApiError instance, convert it
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    error = new ApiError(statusCode, message, error?.errors || [], err.stack);
  }

  // Handle Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `A record with that ${field} already exists.`;
    error = new ApiError(400, message);
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid identifier: ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle JSON Web Token errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired');
  }

  const response = {
    success: false,
    statusCode: error.statusCode,
    message: error.message,
    ...(error.errors?.length > 0 && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  };

  res.status(error.statusCode).json(response);
};
