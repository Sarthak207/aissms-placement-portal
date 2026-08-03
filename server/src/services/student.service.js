const { Student, User } = require('../models');
const ApiError = require('../utils/apiError');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { notify } = require('./notification.service');

async function getOwnProfile(userId) {
  const student = await Student.findOne({ userId }).populate('branchId', 'name code');
  if (!student) throw ApiError.notFound('Student profile not found');
  return student;
}

async function updateOwnProfile(userId, updates) {
  const student = await Student.findOne({ userId });
  if (!student) throw ApiError.notFound('Student profile not found');
  Object.assign(student, updates);
  await student.save(); // pre-save hook recalculates profileCompletion
  return student;
}

async function setResumeUrl(userId, url) {
  const student = await Student.findOneAndUpdate({ userId }, { resumeUrl: url }, { new: true });
  if (!student) throw ApiError.notFound('Student profile not found');
  return student;
}

async function setPhotoUrl(userId, url) {
  const student = await Student.findOneAndUpdate({ userId }, { photoUrl: url }, { new: true });
  if (!student) throw ApiError.notFound('Student profile not found');
  return student;
}

async function listStudents(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};

  if (query.branchId) filter.branchId = query.branchId;
  if (query.passingYear) filter.passingYear = query.passingYear;
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.placementStatus) filter.placementStatus = query.placementStatus;
  if (query.minCgpa || query.maxCgpa) {
    filter.cgpa = {};
    if (query.minCgpa) filter.cgpa.$gte = query.minCgpa;
    if (query.maxCgpa) filter.cgpa.$lte = query.maxCgpa;
  }
  if (query.search) {
    filter.rollNumber = { $regex: query.search, $options: 'i' };
  }

  const [students, total] = await Promise.all([
    Student.find(filter).populate('branchId', 'name code').populate('userId', 'name email').sort(sort).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  return { students, meta: buildMeta({ page, limit, total }) };
}

async function getStudentById(id) {
  const student = await Student.findById(id).populate('branchId', 'name code').populate('userId', 'name email');
  if (!student) throw ApiError.notFound('Student not found');
  return student;
}

async function verifyStudent(io, id, { status, remarks }, actor) {
  const student = await Student.findById(id).populate('userId', 'name email');
  if (!student) throw ApiError.notFound('Student not found');

  student.verificationStatus = status;
  await student.save();

  await notify(io, {
    userId: student.userId._id,
    type: 'system',
    title: `Profile ${status}`,
    message:
      status === 'verified'
        ? 'Your profile has been verified by the placement cell.'
        : `Your profile was rejected. ${remarks || ''}`.trim(),
    email: student.userId.email,
  });

  return student;
}

module.exports = {
  getOwnProfile,
  updateOwnProfile,
  setResumeUrl,
  setPhotoUrl,
  listStudents,
  getStudentById,
  verifyStudent,
};
