const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { Announcement, Coordinator } = require('../models');
const { parsePagination, buildMeta } = require('../utils/pagination');
const ApiError = require('../utils/apiError');

const create = asyncHandler(async (req, res) => {
  let { departmentId } = req.body;

  // Coordinators can only post to their own department (auto-scoped, cannot post college-wide or to other depts)
  if (req.user.role === 'coordinator') {
    const coordinator = await Coordinator.findOne({ userId: req.user._id });
    if (!coordinator) throw ApiError.forbidden('Coordinator profile not found');
    departmentId = coordinator.departmentId;
  }

  const announcement = await Announcement.create({
    postedBy: req.user._id,
    departmentId: departmentId || null,
    title: req.body.title,
    body: req.body.body,
  });
  return new ApiResponse(201, announcement, 'Announcement posted').send(res);
});

const list = asyncHandler(async (req, res) => {
  const { page, limit, skip, sort } = parsePagination(req.query);
  const filter = {};

  // Students/HR see college-wide announcements + (for students) their own department's
  if (req.user.role === 'student') {
    const { Student } = require('../models');
    const student = await Student.findOne({ userId: req.user._id });
    filter.$or = [{ departmentId: null }, { departmentId: student?.branchId ? student.branchId : null }];
  }

  const [announcements, total] = await Promise.all([
    Announcement.find(filter).populate('postedBy', 'name role').sort(sort).skip(skip).limit(limit),
    Announcement.countDocuments(filter),
  ]);
  return new ApiResponse(200, announcements, 'Announcements fetched', buildMeta({ page, limit, total })).send(res);
});

module.exports = { create, list };
