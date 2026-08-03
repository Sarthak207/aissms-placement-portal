const ApiError = require('../utils/apiError');

/**
 * Validates req.body / req.query / req.params against a Zod schema shape:
 *   { body: z.object({...}), query: z.object({...}), params: z.object({...}) }
 * Replaces req.body/query/params with the parsed (coerced/defaulted) values.
 */
const validate = (schema) => (req, res, next) => {
  const toValidate = {
    body: schema.body ? req.body : undefined,
    query: schema.query ? req.query : undefined,
    params: schema.params ? req.params : undefined,
  };

  const results = {};
  const errors = [];

  for (const key of ['body', 'query', 'params']) {
    if (!schema[key]) continue;
    const result = schema[key].safeParse(toValidate[key]);
    if (!result.success) {
      result.error.issues.forEach((issue) =>
        errors.push({ field: `${key}.${issue.path.join('.')}`, message: issue.message })
      );
    } else {
      results[key] = result.data;
    }
  }

  if (errors.length) {
    return next(ApiError.unprocessable('Validation failed', errors));
  }

  if (results.body) req.body = results.body;
  if (results.query) req.query = results.query;
  if (results.params) req.params = results.params;

  return next();
};

module.exports = validate;
