const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    jti: { type: String, required: true, unique: true }, // matches refresh token's jti claim
    refreshTokenHash: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL: auto-deletes at expiry
  },
  { timestamps: true }
);

module.exports = mongoose.model('Session', sessionSchema);
