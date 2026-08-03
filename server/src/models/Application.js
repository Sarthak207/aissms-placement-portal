const mongoose = require('mongoose');

const STATUSES = ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'];

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
    status: { type: String, enum: STATUSES, default: 'applied', index: true },
    statusHistory: [
      {
        status: { type: String, enum: STATUSES },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        note: String,
      },
    ],
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevents a student from applying twice to the same drive
applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
