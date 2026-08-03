const mongoose = require('mongoose');

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, index: true },
    logoUrl: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
    description: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    createdByHR: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyHR' },
  },
  { timestamps: true }
);

const companyHRSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    designation: { type: String, default: '' },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Company = mongoose.model('Company', companySchema);
const CompanyHR = mongoose.model('CompanyHR', companyHRSchema);

module.exports = { Company, CompanyHR };
