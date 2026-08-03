# Database Schema — Mongoose Models

Collections: `Users, Students, Companies, CompanyHRs, PlacementDrives, Applications, Interviews, OfferLetters, Notifications, Announcements, Departments, Branches, Coordinators, AuditLogs, Sessions`

---

### `models/User.js`
```js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['student', 'coordinator', 'tpo', 'company_hr', 'admin'],
      required: true,
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatarUrl: { type: String, default: '' },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

module.exports = mongoose.model('User', userSchema);
```

### `models/Department.js` & `models/Branch.js`
```js
const departmentSchema = new mongoose.Schema(
  { name: { type: String, required: true, unique: true }, code: { type: String, required: true, unique: true } },
  { timestamps: true }
);

const branchSchema = new mongoose.Schema(
  {
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);
```

### `models/Student.js`
```js
const studentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    rollNumber: { type: String, required: true, unique: true },
    branchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
    passingYear: { type: Number, required: true, index: true },

    academics: {
      ssc: { board: String, percentage: Number, yearOfPassing: Number },
      hsc: { board: String, percentage: Number, yearOfPassing: Number },
      diploma: { board: String, percentage: Number, yearOfPassing: Number },
      semesterCgpa: [{ semester: Number, cgpa: Number }],
    },
    cgpa: { type: Number, required: true, min: 0, max: 10, index: true },
    liveBacklogs: { type: Number, default: 0 },
    historyBacklogs: { type: Number, default: 0 },

    skills: {
      programmingLanguages: [String],
      frameworks: [String],
      tools: [String],
    },
    projects: [
      { title: String, description: String, techStack: [String], link: String },
    ],
    internships: [
      { company: String, role: String, duration: String, description: String },
    ],
    achievements: [String],
    certifications: [{ title: String, issuer: String, url: String, date: Date }],
    hackathons: [{ name: String, position: String, date: Date }],

    codingProfiles: {
      github: String,
      linkedin: String,
      leetcode: String,
      codeforces: String,
      geeksforgeeks: String,
      hackerrank: String,
    },

    resumeUrl: String,
    photoUrl: String,
    documents: [{ name: String, url: String, verified: { type: Boolean, default: false } }],

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

// pre-save hook recalculates profileCompletion based on filled sections
```

### `models/Company.js` & `models/CompanyHR.js`
```js
const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, index: true },
    logoUrl: String,
    website: String,
    industry: String,
    description: String,
    verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    createdByHR: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyHR' },
  },
  { timestamps: true }
);

const companyHRSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    designation: String,
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);
```

### `models/PlacementDrive.js`
```js
const driveSchema = new mongoose.Schema(
  {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, index: true },
    title: { type: String, required: true },
    role: { type: String, required: true },
    type: { type: String, enum: ['internship', 'full_time', 'internship_ppo'], required: true },
    description: String,
    ctc: Number,          // annual CTC in LPA
    stipend: Number,      // monthly stipend for internships
    location: String,
    mode: { type: String, enum: ['on_campus', 'off_campus', 'virtual'], default: 'on_campus' },

    eligibility: {
      minCgpa: { type: Number, required: true },
      maxLiveBacklogs: { type: Number, default: 0 },
      maxHistoryBacklogs: { type: Number, default: 0 },
      allowedBranches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Branch' }],
      allowedPassingYears: [Number],
    },
    selectionProcess: [String], // e.g. ['Online Test', 'Technical Interview', 'HR Interview']
    bondDetails: String,
    requiredSkills: [String],

    applicationDeadline: { type: Date, required: true, index: true },
    status: { type: String, enum: ['draft', 'open', 'closed', 'cancelled'], default: 'draft', index: true },
    approvedByTPO: { type: Boolean, default: false },
  },
  { timestamps: true }
);

driveSchema.index({ status: 1, applicationDeadline: 1 });
driveSchema.index({ 'eligibility.minCgpa': 1 });
```

### `models/Application.js`
```js
const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true, index: true },
    status: {
      type: String,
      enum: ['applied', 'shortlisted', 'interview_scheduled', 'selected', 'rejected', 'withdrawn'],
      default: 'applied',
      index: true,
    },
    statusHistory: [
      { status: String, changedAt: { type: Date, default: Date.now }, changedBy: mongoose.Schema.Types.ObjectId },
    ],
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

applicationSchema.index({ studentId: 1, driveId: 1 }, { unique: true }); // prevent duplicate applications
```

### `models/Interview.js`
```js
const interviewSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    round: { type: String, required: true }, // e.g. 'Technical R1'
    scheduledAt: { type: Date, required: true },
    mode: { type: String, enum: ['online', 'offline'], default: 'offline' },
    meetingLink: String,
    venue: String,
    feedback: String,
    result: { type: String, enum: ['pending', 'pass', 'fail'], default: 'pending' },
  },
  { timestamps: true }
);
```

### `models/OfferLetter.js`
```js
const offerLetterSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    ctc: Number,
    pdfUrl: String,
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
```

### `models/Notification.js` & `models/Announcement.js`
```js
const notificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['application', 'interview', 'offer', 'announcement', 'system'], required: true },
    title: String,
    message: String,
    link: String,
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const announcementSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' }, // null = college-wide
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true }
);
```

### `models/Coordinator.js`, `models/AuditLog.js`, `models/Session.js`
```js
const coordinatorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
  },
  { timestamps: true }
);

const auditLogSchema = new mongoose.Schema(
  {
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true }, // e.g. 'DRIVE_APPROVED'
    targetType: String,
    targetId: mongoose.Schema.Types.ObjectId,
    metadata: mongoose.Schema.Types.Mixed,
    ip: String,
  },
  { timestamps: true }
);

const sessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    userAgent: String,
    ip: String,
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index
  },
  { timestamps: true }
);
```

---

## Indexing Strategy Summary
- `User.email` unique; `User.role` for RBAC queries.
- `Student.cgpa + branchId + passingYear` compound index for eligibility filtering.
- `PlacementDrive.status + applicationDeadline` for "open drives" listing.
- `Application.studentId + driveId` unique compound (prevents duplicate applications).
- `Session.expiresAt` TTL index for automatic cleanup of expired refresh tokens.
