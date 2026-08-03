const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const companyService = require('../services/company.service');

const create = asyncHandler(async (req, res) => {
  const company = await companyService.createCompany(req.user._id, req.body);
  return new ApiResponse(201, company, 'Company created, pending TPO approval').send(res);
});

const list = asyncHandler(async (req, res) => {
  const { companies, meta } = await companyService.listCompanies(req.query);
  return new ApiResponse(200, companies, 'Companies fetched', meta).send(res);
});

const getById = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  return new ApiResponse(200, company).send(res);
});

const update = asyncHandler(async (req, res) => {
  const company = await companyService.updateCompany(req.params.id, req.user, req.body);
  return new ApiResponse(200, company, 'Company updated').send(res);
});

const approve = asyncHandler(async (req, res) => {
  const io = req.app.get('io');
  const company = await companyService.approveCompany(io, req.params.id, req.body, req.user);
  return new ApiResponse(200, company, `Company ${req.body.status}`).send(res);
});

const bookmark = asyncHandler(async (req, res) => {
  const result = await companyService.toggleBookmark(req.user._id, req.params.id);
  return new ApiResponse(200, result, result.bookmarked ? 'Company bookmarked' : 'Bookmark removed').send(res);
});

const getMine = asyncHandler(async (req, res) => {
  const company = await companyService.getMyCompany(req.user._id);
  return new ApiResponse(200, company).send(res);
});

module.exports = { create, list, getById, update, approve, bookmark, getMine };
