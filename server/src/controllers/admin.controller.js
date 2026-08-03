const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const adminService = require('../services/admin.service');

const createUser = asyncHandler(async (req, res) => {
  const user = await adminService.createUser(req.user, req.body, req.ip);
  return new ApiResponse(201, user, 'User created').send(res);
});

const listUsers = asyncHandler(async (req, res) => {
  const { users, meta } = await adminService.listUsers(req.query);
  return new ApiResponse(200, users, 'Users fetched', meta).send(res);
});

const updateUser = asyncHandler(async (req, res) => {
  const user = await adminService.updateUser(req.user, req.params.id, req.body, req.ip);
  return new ApiResponse(200, user, 'User updated').send(res);
});

const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.user, req.params.id, req.ip);
  return new ApiResponse(200, null, 'User deleted').send(res);
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await adminService.createDepartment(req.user, req.body, req.ip);
  return new ApiResponse(201, department, 'Department created').send(res);
});

const listDepartments = asyncHandler(async (req, res) => {
  const departments = await adminService.listDepartments();
  return new ApiResponse(200, departments).send(res);
});

const createBranch = asyncHandler(async (req, res) => {
  const branch = await adminService.createBranch(req.user, req.body, req.ip);
  return new ApiResponse(201, branch, 'Branch created').send(res);
});

const listBranches = asyncHandler(async (req, res) => {
  const branches = await adminService.listBranches();
  return new ApiResponse(200, branches).send(res);
});

const auditLogs = asyncHandler(async (req, res) => {
  const { logs, meta } = await adminService.listAuditLogs(req.query);
  return new ApiResponse(200, logs, 'Audit logs fetched', meta).send(res);
});

module.exports = {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  createDepartment,
  listDepartments,
  createBranch,
  listBranches,
  auditLogs,
};
