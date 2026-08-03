const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, Student, Company, CompanyHR, Session } = require('../models');
const ApiError = require('../utils/apiError');
const { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } = require('../utils/jwt');
const { sendPasswordResetEmail } = require('./email.service');
const env = require('../config/env');

const SALT_ROUNDS = 12;
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CAPTCHA_THRESHOLD = 3;

function randomToken() {
  return crypto.randomBytes(32).toString('hex');
}

/** Registers a new Student or Company HR account (other roles are admin-provisioned). */
async function register({ name, email, password, role, rollNumber, branchId, passingYear, companyName }) {
  const existing = await User.findOne({ email });
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    isEmailVerified: true, // email verification disabled — accounts are usable immediately
  });

  // Create the role-specific profile shell
  if (role === 'student') {
    if (!rollNumber || !branchId || !passingYear) {
      throw ApiError.badRequest('rollNumber, branchId and passingYear are required for student registration');
    }
    await Student.create({
      userId: user._id,
      rollNumber,
      branchId,
      passingYear,
      cgpa: 0,
    });
  } else if (role === 'company_hr') {
    let company = companyName ? await Company.findOne({ name: companyName }) : null;
    if (!company && companyName) {
      company = await Company.create({ name: companyName, verificationStatus: 'pending' });
    }
    const hr = await CompanyHR.create({
      userId: user._id,
      companyId: company ? company._id : undefined,
      isApproved: false,
    });
    if (company && !company.createdByHR) {
      company.createdByHR = hr._id;
      await company.save();
    }
  }

  return user.toSafeJSON();
}

async function createSession(user, { userAgent, ip, rememberMe }) {
  const { token: refreshToken, jti } = signRefreshToken(user);
  const expiresAt = new Date(
    Date.now() + (rememberMe ? Number(env.JWT_REFRESH_EXPIRY_MS) * 4 : Number(env.JWT_REFRESH_EXPIRY_MS))
  );

  await Session.create({
    userId: user._id,
    jti,
    refreshTokenHash: hashToken(refreshToken),
    userAgent,
    ip,
    expiresAt,
  });

  return { refreshToken, expiresAt };
}

async function login({ email, password, rememberMe }, { userAgent, ip }) {
  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  if (user.isLocked()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    throw ApiError.tooMany(`Account locked due to repeated failed attempts. Try again in ${minutesLeft} minute(s).`);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    user.failedLoginAttempts += 1;
    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      user.failedLoginAttempts = 0;
    }
    await user.save();

    const remaining = Math.max(MAX_FAILED_ATTEMPTS - user.failedLoginAttempts, 0);
    const requiresCaptcha = user.failedLoginAttempts >= CAPTCHA_THRESHOLD;
    throw ApiError.unauthorized(
      `Invalid email or password. ${remaining} attempt(s) remaining before lockout.${
        requiresCaptcha ? ' CAPTCHA required.' : ''
      }`
    );
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Account has been deactivated. Contact the placement cell.');
  }

  // Successful login — reset failure counters
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signAccessToken(user);
  const { refreshToken, expiresAt } = await createSession(user, { userAgent, ip, rememberMe });

  return { user: user.toSafeJSON(), accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

/** Rotates the refresh token: verifies + revokes the old one, issues a new pair. */
async function refresh(oldRefreshToken, { userAgent, ip }) {
  if (!oldRefreshToken) throw ApiError.unauthorized('Missing refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(oldRefreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  const session = await Session.findOne({ jti: payload.jti, userId: payload.sub, revoked: false });
  if (!session) throw ApiError.unauthorized('Session not found or already revoked');
  if (session.refreshTokenHash !== hashToken(oldRefreshToken)) {
    // Token reuse detected — possible theft. Revoke all sessions for this user.
    await Session.updateMany({ userId: payload.sub }, { revoked: true });
    throw ApiError.unauthorized('Token reuse detected. All sessions revoked for security.');
  }

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized('User no longer active');

  session.revoked = true;
  await session.save();

  const accessToken = signAccessToken(user);
  const { refreshToken, expiresAt } = await createSession(user, { userAgent, ip, rememberMe: false });

  return { user: user.toSafeJSON(), accessToken, refreshToken, refreshExpiresAt: expiresAt };
}

async function logout(refreshToken) {
  if (!refreshToken) return;
  try {
    const payload = verifyRefreshToken(refreshToken);
    await Session.updateOne({ jti: payload.jti }, { revoked: true });
  } catch {
    // token already invalid/expired — nothing to revoke
  }
}

async function forgotPassword(email) {
  const user = await User.findOne({ email });
  if (!user) return; // Do not reveal whether the email exists

  const resetToken = randomToken();
  user.passwordResetTokenHash = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  const resetUrl = `${env.CLIENT_URL}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`;
  await sendPasswordResetEmail(email, user.name, resetUrl);
}

async function resetPassword({ email, token, newPassword }) {
  const user = await User.findOne({ email }).select('+passwordResetTokenHash +passwordResetExpires');
  if (!user || !user.passwordResetTokenHash || user.passwordResetExpires < new Date()) {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }
  if (hashToken(token) !== user.passwordResetTokenHash) {
    throw ApiError.badRequest('Reset link is invalid or has expired');
  }

  user.passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetTokenHash = undefined;
  user.passwordResetExpires = undefined;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // Invalidate all existing sessions on password change
  await Session.updateMany({ userId: user._id }, { revoked: true });
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
};
