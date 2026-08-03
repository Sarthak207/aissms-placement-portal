const ApiError = require('../../src/utils/apiError');

describe('ApiError', () => {
  it('sets the correct status code and message for each factory method', () => {
    expect(ApiError.badRequest('bad').statusCode).toBe(400);
    expect(ApiError.unauthorized().statusCode).toBe(401);
    expect(ApiError.forbidden().statusCode).toBe(403);
    expect(ApiError.notFound().statusCode).toBe(404);
    expect(ApiError.conflict().statusCode).toBe(409);
    expect(ApiError.unprocessable().statusCode).toBe(422);
    expect(ApiError.tooMany().statusCode).toBe(429);
    expect(ApiError.internal().statusCode).toBe(500);
  });

  it('carries a field-level errors array through unprocessable()', () => {
    const err = ApiError.unprocessable('Validation failed', [{ field: 'email', message: 'Invalid' }]);
    expect(err.errors).toHaveLength(1);
    expect(err.errors[0].field).toBe('email');
  });

  it('is an instance of Error with isOperational flag set', () => {
    const err = ApiError.notFound('missing');
    expect(err).toBeInstanceOf(Error);
    expect(err.isOperational).toBe(true);
    expect(err.message).toBe('missing');
  });
});
