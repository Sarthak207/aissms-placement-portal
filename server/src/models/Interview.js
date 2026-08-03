const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    round: { type: String, required: true },
    scheduledAt: { type: Date, required: true },
    mode: { type: String, enum: ['online', 'offline'], default: 'offline' },
    meetingLink: { type: String, default: '' },
    venue: { type: String, default: '' },
    feedback: { type: String, default: '' },
    result: { type: String, enum: ['pending', 'pass', 'fail'], default: 'pending' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Interview', interviewSchema);
