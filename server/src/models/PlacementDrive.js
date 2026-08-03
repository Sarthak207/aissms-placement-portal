const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    type: { type: String, enum: ['internship', 'full_time', 'internship_ppo'], required: true },
    description: { type: String, default: '' },

    ctc: { type: Number, default: 0 }, // LPA
    stipend: { type: Number, default: 0 }, // per month
    location: { type: String, default: '' },
    mode: { type: String, enum: ['on_campus', 'off_campus', 'virtual'], default: 'on_campus' },

    eligibility: {
      minCgpa: { type: Number, required: true, min: 0, max: 10 },
      maxLiveBacklogs: { type: Number, default: 0 },
      maxHistoryBacklogs: { type: Number, default: 0 },
      allowedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
      allowedPassingYears: [Number],
    },
    selectionProcess: [String],
    bondDetails: { type: String, default: '' },
    requiredSkills: [{ type: String, trim: true }],

    applicationDeadline: { type: Date, required: true, index: true },
    status: { type: String, enum: ['draft', 'open', 'closed', 'cancelled'], default: 'draft', index: true },
    approvedByTPO: { type: Boolean, default: false },
    createdByHR: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyHR' },
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, applicationDeadline: 1 });
driveSchema.index({ 'eligibility.minCgpa': 1 });
driveSchema.index({ title: 'text', role: 'text', requiredSkills: 'text' });

/** Checks whether a given student document satisfies this drive's eligibility rules. */
driveSchema.methods.isStudentEligible = function isStudentEligible(student) {
  const e = this.eligibility;
  if (student.cgpa < e.minCgpa) return false;
  if (student.liveBacklogs > e.maxLiveBacklogs) return false;
  if (student.historyBacklogs > e.maxHistoryBacklogs) return false;
  if (e.allowedBranches?.length && !e.allowedBranches.some((b) => b.equals(student.branchId))) return false;
  if (e.allowedPassingYears?.length && !e.allowedPassingYears.includes(student.passingYear)) return false;
  return true;
};

module.exports = mongoose.model('PlacementDrive', driveSchema);
