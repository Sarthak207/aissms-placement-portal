const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    passingYear: { type: Number, required: true, index: true },

    academics: {
      ssc: {
        board: String,
        percentage: { type: Number, min: 0, max: 100 },
        yearOfPassing: Number,
      },
      hsc: {
        board: String,
        percentage: { type: Number, min: 0, max: 100 },
        yearOfPassing: Number,
      },
      diploma: {
        board: String,
        percentage: { type: Number, min: 0, max: 100 },
        yearOfPassing: Number,
      },
      semesterCgpa: [
        {
          semester: { type: Number, min: 1, max: 8 },
          cgpa: { type: Number, min: 0, max: 10 },
        },
      ],
    },
    cgpa: { type: Number, required: true, min: 0, max: 10, index: true },
    liveBacklogs: { type: Number, default: 0, min: 0 },
    historyBacklogs: { type: Number, default: 0, min: 0 },

    skills: {
      programmingLanguages: [{ type: String, trim: true }],
      frameworks: [{ type: String, trim: true }],
      tools: [{ type: String, trim: true }],
    },
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],
    internships: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],
    achievements: [String],
    certifications: [
      {
        title: String,
        issuer: String,
        url: String,
        date: Date,
      },
    ],
    hackathons: [
      {
        name: String,
        position: String,
        date: Date,
      },
    ],

    codingProfiles: {
      github: String,
      linkedin: String,
      leetcode: String,
      codeforces: String,
      geeksforgeeks: String,
      hackerrank: String,
    },

    resumeUrl: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    documents: [
      {
        name: String,
        url: String,
        verified: { type: Boolean, default: false },
      },
    ],

    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    placementStatus: {
      type: String,
      enum: ['unplaced', 'placed', 'multiple_offers'],
      default: 'unplaced',
      index: true,
    },
    bookmarkedCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  },
  { timestamps: true }
);

studentSchema.index({ cgpa: 1, branchId: 1, passingYear: 1 });

/** Recalculates profile completion % based on which sections are filled. */
studentSchema.methods.calculateProfileCompletion = function calculateProfileCompletion() {
  const checks = [
    !!this.academics?.ssc?.percentage,
    !!this.academics?.hsc?.percentage,
    !!this.cgpa,
    (this.skills?.programmingLanguages?.length || 0) > 0,
    (this.projects?.length || 0) > 0,
    !!this.resumeUrl,
    !!this.photoUrl,
    !!this.codingProfiles?.github || !!this.codingProfiles?.linkedin,
  ];
  const filled = checks.filter(Boolean).length;
  this.profileCompletion = Math.round((filled / checks.length) * 100);
  return this.profileCompletion;
};

studentSchema.pre('save', function preSave(next) {
  this.calculateProfileCompletion();
  next();
});

module.exports = mongoose.model('Student', studentSchema);
