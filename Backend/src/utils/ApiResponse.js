/**
 * ==============================================================================
 * Standardized API Response Helper Class
 * ==============================================================================
 * Enforces consistent JSON response shape across all backend endpoints:
 * {
 *   success: true,
 *   statusCode: 200,
 *   message: "Operation completed successfully",
 *   data: { ... }
 * }
 */

class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code (200, 201, etc.)
   * @param {*} data - Response payload (object, array, null)
   * @param {string} message - Human-readable success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
  }
}

export default ApiResponse;
