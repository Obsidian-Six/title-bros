/**
 * ==============================================================================
 * Request Validation Result Handler Middleware
 * ==============================================================================
 * Inspects express-validator results for the current request.
 * If validation issues exist, formats errors neatly and forwards an ApiError (400)
 * to the centralized error handler.
 */

import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Express middleware to validate request results
 */
export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));

    // Construct a concise summary message from the first failure
    const primaryMessage = formattedErrors[0]?.message || 'Validation failed';

    return next(new ApiError(400, primaryMessage, formattedErrors));
  }

  next();
};

export default validateRequest;
