const { OfferLetter, Application, CompanyHR, PlacementDrive } = require('../models');
const ApiError = require('../utils/apiError');
const { generateOfferLetterPdf } = require('./pdf.service');
const { cloudinary } = require('../config/cloudinary');
const { notify } = require('./notification.service');

function uploadBufferToCloudinary(buffer, folder, publicId) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, resource_type: 'raw', format: 'pdf' },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(buffer);
  });
}

async function issueOffer(io, data, requester) {
  const application = await Application.findById(data.applicationId).populate({
    path: 'studentId',
    populate: { path: 'userId', select: 'name email' },
  });
  if (!application) throw ApiError.notFound('Application not found');
  if (application.status !== 'selected') {
    throw ApiError.badRequest('Offer can only be issued once the application status is "selected"');
  }

  const drive = await PlacementDrive.findById(application.driveId).populate('companyId', 'name');
  if (requester.role === 'company_hr') {
    const hr = await CompanyHR.findOne({ userId: requester._id });
    if (!hr || !drive.companyId._id.equals(hr.companyId)) throw ApiError.forbidden('Not your drive');
  }

  const existing = await OfferLetter.findOne({ applicationId: application._id });
  if (existing) throw ApiError.conflict('Offer letter already issued for this application');

  const pdfBuffer = await generateOfferLetterPdf({
    studentName: application.studentId.userId.name,
    companyName: drive.companyId.name,
    role: drive.role,
    ctc: data.ctc,
    joiningDetails: data.joiningDetails,
  });

  const uploadResult = await uploadBufferToCloudinary(
    pdfBuffer,
    'aissms-placement/offer-letters',
    `offer-${application._id}`
  );

  const offer = await OfferLetter.create({
    applicationId: application._id,
    studentId: application.studentId._id,
    driveId: drive._id,
    ctc: data.ctc,
    pdfUrl: uploadResult.secure_url,
  });

  await notify(io, {
    userId: application.studentId.userId._id,
    type: 'offer',
    title: 'Offer letter issued 🎉',
    message: `Congratulations! Your offer letter from ${drive.companyId.name} is ready to download.`,
    link: `/offers/${offer._id}/download`,
    email: application.studentId.userId.email,
  });

  return offer;
}

async function myOffers(studentUserId) {
  const { Student } = require('../models');
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) throw ApiError.notFound('Student profile not found');
  return OfferLetter.find({ studentId: student._id }).populate({
    path: 'driveId',
    populate: { path: 'companyId', select: 'name logoUrl' },
  });
}

async function getOfferById(id, requester) {
  const offer = await OfferLetter.findById(id).populate({
    path: 'studentId',
    populate: { path: 'userId', select: 'name email' },
  });
  if (!offer) throw ApiError.notFound('Offer letter not found');

  if (requester.role === 'student') {
    const { Student } = require('../models');
    const student = await Student.findOne({ userId: requester._id });
    if (!student || !offer.studentId._id.equals(student._id)) throw ApiError.forbidden('Not your offer letter');
  }
  return offer;
}

module.exports = { issueOffer, myOffers, getOfferById };
