const bcrypt = require('bcryptjs');
const { User, Department, Branch, Coordinator, AuditLog } = require('../models');
const ApiError = require('../utils/apiError');
const { parsePagination, buildMeta } = require('../utils/pagination');

const SALT_ROUNDS = 12;

async function logAction(actorId, action, targetType, targetId, metadata = {}, ip = '') {
  await AuditLog.create({ actorId, action, targetType, targetId, metadata, ip });
}

/** Admin directly provisions coordinator/tpo/admin accounts (pre-verified, no email flow needed). */
async function createUser(actor, data, ip) {
  const existing = await User.findOne({ email: data.email });
  if (existing) throw ApiError.conflict('A user with this email already exists');

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const user = await User.create({
    name: data.name,
    email: data.email,
    passwordHash,
    role: data.role,
    isEmailVerified: true, // admin-created accounts are trusted
  });

  if (data.role === 'coordinator') {
    if (!data.departmentId) throw ApiError.badRequest('departmentId is required for coordinator accounts');
    await Coordinator.create({ userId: user._id, departmentId: data.departmentId });
  }

  await logAction(actor._id, 'USER_CREATED', 'User', user._id, { role: data.role }, ip);
  return user.toSafeJSON();
}

async function listUsers(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};
  if (query.role) filter.role = query.role;
  if (query.search) filter.$or = [{ name: { $regex: query.search, $options: 'i' } }, { email: { $regex: query.search, $options: 'i' } }];

  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  return { users, meta: buildMeta({ page, limit, total }) };
}

async function updateUser(actor, id, updates, ip) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');

  Object.assign(user, updates);
  await user.save();
  await logAction(actor._id, 'USER_UPDATED', 'User', user._id, updates, ip);
  return user.toSafeJSON();
}

async function deleteUser(actor, id, ip) {
  const user = await User.findById(id);
  if (!user) throw ApiError.notFound('User not found');
  await user.deleteOne();
  await logAction(actor._id, 'USER_DELETED', 'User', id, {}, ip);
}

async function createDepartment(actor, data, ip) {
  const department = await Department.create(data);
  await logAction(actor._id, 'DEPARTMENT_CREATED', 'Department', department._id, data, ip);
  return department;
}

async function createBranch(actor, data, ip) {
  const branch = await Branch.create(data);
  await logAction(actor._id, 'BRANCH_CREATED', 'Branch', branch._id, data, ip);
  return branch;
}

async function listDepartments() {
  return Department.find({}).sort('name');
}

async function listBranches() {
  return Branch.find({}).populate('departmentId', 'name code').sort('name');
}

async function listAuditLogs(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};
  if (query.action) filter.action = query.action;
  if (query.actorId) filter.actorId = query.actorId;

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).populate('actorId', 'name email role').sort(sort).skip(skip).limit(limit),
    AuditLog.countDocuments(filter),
  ]);
  return { logs, meta: buildMeta({ page, limit, total }) };
}

module.exports = {
  createUser,
  listUsers,
  updateUser,
  deleteUser,
  createDepartment,
  createBranch,
  listDepartments,
  listBranches,
  listAuditLogs,
  logAction,
};
