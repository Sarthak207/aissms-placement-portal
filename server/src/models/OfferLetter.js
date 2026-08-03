const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    driveId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlacementDrive', required: true },
    ctc: { type: Number, default: 0 },
    pdfUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OfferLetter', offerLetterSchema);
