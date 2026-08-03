const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/apiError');

/**
 * Converts known error types (Mongoose, JWT, Multer) into ApiError instances,
 * then sends a consistent JSON error response. Must be registered LAST.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let error = err;

  if (!(error instanceof ApiError)) {
    if (error.name === 'ValidationError') {
      // Mongoose schema validation error
      const errors = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
      error = ApiError.unprocessable('Validation failed', errors);
    } else if (error.code === 11000) {
      // Mongo duplicate key
      const field = Object.keys(error.keyValue || {})[0] || 'field';
      error = ApiError.conflict(`Duplicate value for '${field}'`);
    } else if (error.name === 'CastError') {
      error = ApiError.badRequest(`Invalid value for '${error.path}'`);
    } else if (error.name === 'MulterError') {
      error = ApiError.badRequest(error.message);
    } else {
      error = new ApiError(error.statusCode || 500, error.message || 'Internal server error');
    }
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${error.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${error.message}`);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
