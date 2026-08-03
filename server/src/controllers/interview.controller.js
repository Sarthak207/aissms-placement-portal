const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const interviewService = require('../services/interview.service');

const schedule = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const interview = await interviewService.schedule(io, req.body, req.user);
  return new ApiResponse(201, interview, 'Interview scheduled').send(res);
});

const update = asyncHandler(async (req, res) => {
  const interview = await interviewService.update(req.params.id, req.body, req.user);
  return new ApiResponse(200, interview, 'Interview updated').send(res);
});

const myInterviews = asyncHandler(async (req, res) => {
  const interviews = await interviewService.myInterviews(req.user._id);
  return new ApiResponse(200, interviews).send(res);
});

module.exports = { schedule, update, myInterviews };
