const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT || 587),
  secure: Number(env.SMTP_PORT) === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

async function sendMail({ to, subject, html }) {
  if (!env.SMTP_HOST) {
    // No SMTP configured (e.g. local dev) — log instead of throwing so the flow still works.
    logger.warn(`SMTP not configured — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    await transporter.sendMail({ from: env.SMTP_FROM, to, subject, html });
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
  }
}

const sendVerificationEmail = (to, name, verifyUrl) =>
  sendMail({
    to,
    subject: 'Verify your AISSMS Placement Portal account',
    html: `<p>Hi ${name},</p>
      <p>Welcome to the AISSMS Placement Portal. Please verify your email to activate your account:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>This link expires in 24 hours.</p>`,
  });

const sendPasswordResetEmail = (to, name, resetUrl) =>
  sendMail({
    to,
    subject: 'Reset your AISSMS Placement Portal password',
    html: `<p>Hi ${name},</p>
      <p>We received a request to reset your password. Click below to set a new one:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>`,
  });

module.exports = { sendMail, sendVerificationEmail, sendPasswordResetEmail };
