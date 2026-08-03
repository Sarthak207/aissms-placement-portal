const ApiError = require('../utils/apiError');

/**
 * Route-level RBAC. Usage: router.get('/x', authenticate, authorize('tpo', 'admin'), handler)
 * Must run AFTER `authenticate` so req.user is populated.
 * Row-level checks (e.g. "HR can only edit their own drives") happen in the service layer.
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Role '${req.user.role}' is not permitted to perform this action`));
  }
  return next();
};

module.exports = authorize;
