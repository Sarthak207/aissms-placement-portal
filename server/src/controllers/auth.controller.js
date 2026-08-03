const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const authService = require('../services/auth.service');
const env = require('../config/env');

const REFRESH_COOKIE_NAME = 'refreshToken';

const cookieOptions = (expiresAt) => ({
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  // 'none' is required in production because the frontend (Vercel) and backend (Render)
  // are on different domains — cross-site requests never send Strict/Lax cookies, only
  // None does, and browsers require Secure=true alongside SameSite=None.
  sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
  expires: expiresAt,
  path: '/api/v1/auth', // scope cookie to auth routes only
});

const register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return new ApiResponse(201, user, 'Registration successful. You can log in now.').send(res);
});

const login = asyncHandler(async (req, res) => {
  const meta = { userAgent: req.headers['user-agent'], ip: req.ip };
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.login(req.body, meta);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(refreshExpiresAt));
  return new ApiResponse(200, { user, accessToken }, 'Login successful').send(res);
});

const refresh = asyncHandler(async (req, res) => {
  const meta = { userAgent: req.headers['user-agent'], ip: req.ip };
  const oldToken = req.cookies?.[REFRESH_COOKIE_NAME];
  const { user, accessToken, refreshToken, refreshExpiresAt } = await authService.refresh(oldToken, meta);

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, cookieOptions(refreshExpiresAt));
  return new ApiResponse(200, { user, accessToken }, 'Token refreshed').send(res);
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE_NAME];
  await authService.logout(token);
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/v1/auth' });
  return new ApiResponse(200, null, 'Logged out successfully').send(res);
});

const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  // Always return a generic success message — never reveal if the email exists
  return new ApiResponse(200, null, 'If an account exists for this email, a reset link has been sent.').send(res);
});

const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return new ApiResponse(200, null, 'Password reset successfully. Please log in with your new password.').send(res);
});

const me = asyncHandler(async (req, res) => {
  return new ApiResponse(200, req.user.toSafeJSON(), 'Current user').send(res);
});

module.exports = { register, login, refresh, logout, forgotPassword, resetPassword, me };
