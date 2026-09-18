/**
 * ==============================================================================
 * Role-Based Access Control (RBAC) Middleware
 * ==============================================================================
 * Enforces granular permissions based on User roles:
 * - SUPER_ADMIN: Root platform privileges, provisions Admins
 * - ADMIN: Title Bros internal staff
 * - CUSTOMER: Public borrower / loan applicant
 *
 * Rejects unauthorized role requests with 403 Forbidden.
 */

import ApiError from '../utils/ApiError.js';

/**
 * Middleware generator: Restrict route access to specified roles
 * @param  {...string} allowedRoles - List of permitted role names
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    // req.user is set by the preceding protect middleware
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access Forbidden: Role '${req.user?.role || 'Guest'}' lacks permission to access this resource.`
        )
      );
    }
    next();
  };
};

export default restrictTo;
