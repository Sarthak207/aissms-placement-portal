const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const studentService = require('../services/student.service');

const getMe = asyncHandler(async (req, res) => {
  const student = await studentService.getOwnProfile(req.user._id);
  return new ApiResponse(200, student).send(res);
});

const updateMe = asyncHandler(async (req, res) => {
  const student = await studentService.updateOwnProfile(req.user._id, req.body);
  return new ApiResponse(200, student, 'Profile updated').send(res);
});

const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) return new ApiResponse(400, null, 'No file uploaded').send(res);
  const student = await studentService.setResumeUrl(req.user._id, req.file.path);
  return new ApiResponse(200, student, 'Resume uploaded').send(res);
});

const uploadPhoto = asyncHandler(async (req, res) => {
  if (!req.file) return new ApiResponse(400, null, 'No file uploaded').send(res);
  const student = await studentService.setPhotoUrl(req.user._id, req.file.path);
  return new ApiResponse(200, student, 'Photo uploaded').send(res);
});

const list = asyncHandler(async (req, res) => {
  const { students, meta } = await studentService.listStudents(req.query);
  return new ApiResponse(200, students, 'Students fetched', meta).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  return new ApiResponse(200, student).send(res);
});

const verify = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const student = await studentService.verifyStudent(io, req.params.id, req.body, req.user);
  return new ApiResponse(200, student, `Student profile ${req.body.status}`).send(res);
});

module.exports = { getMe, updateMe, uploadResume, uploadPhoto, list, getById, verify };
