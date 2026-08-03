const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const driveService = require('../services/drive.service');

const create = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const drive = await driveService.createDrive(io, req.body, req.user);
  return new ApiResponse(201, drive, 'Drive created as draft. Awaiting TPO approval to open.').send(res);
});

const list = asyncHandler(async (req, res) => {
  const { drives, meta } = await driveService.listDrives(req.query);
  return new ApiResponse(200, drives, 'Drives fetched', meta).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const drive = await driveService.getDriveById(req.params.id);
  return new ApiResponse(200, drive).send(res);
});

const update = asyncHandler(async (req, res) => {
  const drive = await driveService.updateDrive(req.params.id, req.body, req.user);
  return new ApiResponse(200, drive, 'Drive updated').send(res);
});

const remove = asyncHandler(async (req, res) => {
  await driveService.deleteDrive(req.params.id, req.user);
  return new ApiResponse(200, null, 'Drive deleted').send(res);
});

const open = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const drive = await driveService.openDrive(io, req.params.id, req.user);
  return new ApiResponse(200, drive, 'Drive opened and eligible students notified').send(res);
});

const close = asyncHandler(async (req, res) => {
  const drive = await driveService.closeDrive(req.params.id, req.user);
  return new ApiResponse(200, drive, 'Drive closed').send(res);
});

const eligibleStudents = asyncHandler(async (req, res) => {
  const drive = await driveService.getDriveById(req.params.id);
  const students = await driveService.getEligibleStudents(drive);
  return new ApiResponse(200, students).send(res);
});

const applicants = asyncHandler(async (req, res) => {
  const result = await driveService.listApplicants(req.params.id, req.user, req.query);
  if (result.isExport) {
    res.setHeader('Content-Disposition', 'attachment; filename=applicants.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(result.buffer);
  }
  return new ApiResponse(200, result.applications).send(res);
});

module.exports = { create, list, getById, update, remove, open, close, eligibleStudents, applicants };
