const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const analyticsService = require('../services/analytics.service');

const overview = asyncHandler(async (req, res) => {
  const data = await analyticsService.overview();
  return new ApiResponse(200, data).send(res);
});

const trends = asyncHandler(async (req, res) => {
  const data = await analyticsService.trends();
  return new ApiResponse(200, data).send(res);
});

const topRecruiters = asyncHandler(async (req, res) => {
  const data = await analyticsService.topRecruiters(Number(req.query.limit) || 10);
  return new ApiResponse(200, data).send(res);
});

const funnel = asyncHandler(async (req, res) => {
  const data = await analyticsService.applicationFunnel();
  return new ApiResponse(200, data).send(res);
});

module.exports = { overview, trends, topRecruiters, funnel };
