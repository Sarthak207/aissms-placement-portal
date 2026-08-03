const { Interview, Application, CompanyHR, PlacementDrive } = require('../models');
const ApiError = require('../utils/apiError');
const { notify } = require('./notification.service');

async function assertOwnsApplication(application, requester) {
  if (['tpo', 'admin'].includes(requester.role)) return;
  const drive = await PlacementDrive.findById(application.driveId);
  const hr = await CompanyHR.findOne({ userId: requester._id });
  if (!hr || !drive.companyId.equals(hr.companyId)) throw ApiError.forbidden('Not your drive');
}

async function schedule(io, data, requester) {
  const application = await Application.findById(data.applicationId).populate({
    path: 'studentId',
    populate: { path: 'userId', select: 'name email' },
  });
  if (!application) throw ApiError.notFound('Application not found');
  await assertOwnsApplication(application, requester);

  const interview = await Interview.create({ ...data, driveId: application.driveId });

  if (application.status === 'shortlisted') {
    application.status = 'interview_scheduled';
    application.statusHistory.push({ status: 'interview_scheduled', changedBy: requester._id });
    await application.save();
  }

  await notify(io, {
    userId: application.studentId.userId._id,
    type: 'interview',
    title: 'Interview scheduled',
    message: `Your "${data.round}" interview is scheduled for ${new Date(data.scheduledAt).toLocaleString()}.`,
    link: `/interviews`,
    email: application.studentId.userId.email,
  });

  return interview;
}

async function update(id, updates, requester) {
  const interview = await Interview.findById(id);
  if (!interview) throw ApiError.notFound('Interview not found');
  const application = await Application.findById(interview.applicationId);
  await assertOwnsApplication(application, requester);

  Object.assign(interview, updates);
  await interview.save();
  return interview;
}

async function myInterviews(studentUserId) {
  const { Student } = require('../models');
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) throw ApiError.notFound('Student profile not found');

  const applications = await Application.find({ studentId: student._id }).select('_id');
  const applicationIds = applications.map((a) => a._id);

  return Interview.find({ applicationId: { $in: applicationIds } })
    .populate({ path: 'driveId', populate: { path: 'companyId', select: 'name logoUrl' } })
    .sort('scheduledAt');
}

module.exports = { schedule, update, myInterviews };
