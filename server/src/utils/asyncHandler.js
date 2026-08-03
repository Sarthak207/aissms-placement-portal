/**
 * Wraps an async Express route handler so any thrown/rejected error
 * is forwarded to the centralized error-handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
