/**
 * ==============================================================================
 * Custom API Error Handler Class
 * ==============================================================================
 * Extends the native JavaScript Error class to encapsulate HTTP status codes,
 * operational flags, and error details for predictable client error responses.
 */

class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g., 400, 401, 403, 404, 500)
   * @param {string} message - Descriptive error message
   * @param {Array} errors - Optional array of granular validation error items
   * @param {string} stack - Optional custom stack trace
   */
  constructor(statusCode, message = 'Something went wrong', errors = [], stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.data = null;
    this.success = false;
    this.errors = errors;
    this.isOperational = true; // Flag identifying trusted operational errors vs program bugs

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
