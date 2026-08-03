const { Application, PlacementDrive, Student, CompanyHR } = require('../models');
const ApiError = require('../utils/apiError');
const { notify } = require('./notification.service');

const VALID_TRANSITIONS = {
  applied: ['shortlisted', 'rejected'],
  shortlisted: ['interview_scheduled', 'rejected'],
  interview_scheduled: ['selected', 'rejected'],
  selected: [],
  rejected: [],
  withdrawn: [],
};

async function apply(studentUserId, driveId) {
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) throw ApiError.notFound('Student profile not found');
  if (student.verificationStatus !== 'verified') {
    throw ApiError.forbidden('Your profile must be verified by a coordinator before applying');
  }

  const drive = await PlacementDrive.findById(driveId);
  if (!drive) throw ApiError.notFound('Drive not found');
  if (drive.status !== 'open') throw ApiError.badRequest('This drive is not currently accepting applications');
  if (drive.applicationDeadline < new Date()) throw ApiError.badRequest('Application deadline has passed');

  if (!drive.isStudentEligible(student)) {
    throw ApiError.forbidden('You do not meet the eligibility criteria for this drive');
  }

  const existing = await Application.findOne({ studentId: student._id, driveId });
  if (existing) throw ApiError.conflict('You have already applied to this drive');

  const application = await Application.create({
    studentId: student._id,
    driveId,
    status: 'applied',
    statusHistory: [{ status: 'applied', changedBy: studentUserId }],
  });
  return application;
}

async function withdraw(studentUserId, applicationId) {
  const student = await Student.findOne({ userId: studentUserId });
  const application = await Application.findById(applicationId);
  if (!application) throw ApiError.notFound('Application not found');
  if (!application.studentId.equals(student._id)) throw ApiError.forbidden('Not your application');
  if (!['applied', 'shortlisted'].includes(application.status)) {
    throw ApiError.badRequest('Cannot withdraw an application at this stage');
  }

  application.status = 'withdrawn';
  application.statusHistory.push({ status: 'withdrawn', changedBy: studentUserId });
  await application.save();
  return application;
}

async function myApplications(studentUserId) {
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) throw ApiError.notFound('Student profile not found');
  return Application.find({ studentId: student._id })
    .populate({ path: 'driveId', populate: { path: 'companyId', select: 'name logoUrl' } })
    .sort('-appliedAt');
}

async function getApplicationById(id, requester) {
  const application = await Application.findById(id)
    .populate({ path: 'studentId', populate: [{ path: 'userId', select: 'name email' }] })
    .populate({ path: 'driveId', populate: { path: 'companyId', select: 'name' } });
  if (!application) throw ApiError.notFound('Application not found');

  if (requester.role === 'student') {
    const student = await Student.findOne({ userId: requester._id });
    if (!student || !application.studentId._id.equals(student._id)) throw ApiError.forbidden('Not your application');
  } else if (requester.role === 'company_hr') {
    const hr = await CompanyHR.findOne({ userId: requester._id });
    if (!hr || !application.driveId.companyId._id.equals(hr.companyId)) throw ApiError.forbidden('Not your drive');
  }

  return application;
}

async function updateStatus(io, id, { status, note }, requester) {
  const application = await Application.findById(id).populate({
    path: 'studentId',
    populate: { path: 'userId', select: 'name email' },
  });
  if (!application) throw ApiError.notFound('Application not found');

  const drive = await PlacementDrive.findById(application.driveId);
  if (requester.role === 'company_hr') {
    const hr = await CompanyHR.findOne({ userId: requester._id });
    if (!hr || !drive.companyId.equals(hr.companyId)) throw ApiError.forbidden('Not your drive');
  }

  const allowed = VALID_TRANSITIONS[application.status] || [];
  if (!allowed.includes(status)) {
    throw ApiError.badRequest(`Cannot transition from '${application.status}' to '${status}'`);
  }

  application.status = status;
  application.statusHistory.push({ status, changedBy: requester._id, note });
  await application.save();

  if (status === 'selected') {
    await Student.updateOne({ _id: application.studentId._id }, { placementStatus: 'placed' });
  }

  await notify(io, {
    userId: application.studentId.userId._id,
    type: 'application',
    title: 'Application status updated',
    message: `Your application status changed to "${status.replace('_', ' ')}".`,
    link: `/applications/${application._id}`,
    email: application.studentId.userId.email,
  });

  return application;
}

module.exports = { apply, withdraw, myApplications, getApplicationById, updateStatus };
