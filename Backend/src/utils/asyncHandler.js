/**
 * ==============================================================================
 * Async Handler Wrapper Utility
 * ==============================================================================
 * Wraps asynchronous Express route handlers to automatically catch rejected
 * promises and forward errors to Express's next() error handling middleware.
 * Eliminates repetitive try/catch boilerplate in controllers.
 */

export const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};

export default asyncHandler;
