const { Student, OfferLetter, Branch } = require('../models');
const { buildExcelBuffer } = require('./excel.service');
const { generateTablePdf } = require('./pdf.service');
const ApiError = require('../utils/apiError');

async function placementReportRows() {
  const students = await Student.find({ placementStatus: { $in: ['placed', 'multiple_offers'] } })
    .populate('userId', 'name email')
    .populate('branchId', 'name');

  const offers = await OfferLetter.find({}).select('studentId ctc issuedAt');
  const offerByStudent = new Map(offers.map((o) => [o.studentId.toString(), o]));

  return students.map((s) => {
    const offer = offerByStudent.get(s._id.toString());
    return {
      Name: s.userId?.name || '',
      Email: s.userId?.email || '',
      RollNumber: s.rollNumber,
      Branch: s.branchId?.name || '',
      CGPA: s.cgpa,
      CTC: offer?.ctc || '',
      IssuedAt: offer?.issuedAt ? offer.issuedAt.toISOString().slice(0, 10) : '',
    };
  });
}

async function branchReportRows(branchId) {
  const branch = await Branch.findById(branchId);
  if (!branch) throw ApiError.notFound('Branch not found');

  const students = await Student.find({ branchId }).populate('userId', 'name email');
  return students.map((s) => ({
    Name: s.userId?.name || '',
    Email: s.userId?.email || '',
    RollNumber: s.rollNumber,
    CGPA: s.cgpa,
    PlacementStatus: s.placementStatus,
    VerificationStatus: s.verificationStatus,
  }));
}

async function generateReport(rows, title, format) {
  if (format === 'excel') {
    return { buffer: buildExcelBuffer(rows, title), contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: 'xlsx' };
  }
  const columns = rows.length ? Object.keys(rows[0]) : [];
  const buffer = await generateTablePdf({ title, columns, rows });
  return { buffer, contentType: 'application/pdf', ext: 'pdf' };
}

module.exports = { placementReportRows, branchReportRows, generateReport };
