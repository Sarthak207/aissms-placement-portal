const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const applicationService = require('../services/application.service');

const create = asyncHandler(async (req, res) => {
  const application = await applicationService.apply(req.user._id, req.body.driveId);
  return new ApiResponse(201, application, 'Application submitted').send(res);
});

const withdraw = asyncHandler(async (req, res) => {
  const application = await applicationService.withdraw(req.user._id, req.params.id);
  return new ApiResponse(200, application, 'Application withdrawn').send(res);
});

const myApplications = asyncHandler(async (req, res) => {
  const applications = await applicationService.myApplications(req.user._id);
  return new ApiResponse(200, applications).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const application = await applicationService.getApplicationById(req.params.id, req.user);
  return new ApiResponse(200, application).send(res);
});

const updateStatus = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const application = await applicationService.updateStatus(io, req.params.id, req.body, req.user);
  return new ApiResponse(200, application, 'Application status updated').send(res);
});

module.exports = { create, withdraw, myApplications, getById, updateStatus };
