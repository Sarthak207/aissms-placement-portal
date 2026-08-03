const { PlacementDrive, CompanyHR, Student, Application, Company } = require('../models');
const ApiError = require('../utils/apiError');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { notifyMany } = require('./notification.service');
const { buildExcelBuffer } = require('./excel.service');

async function assertOwnsDrive(drive, requester) {
  if (requester.role === 'admin' || requester.role === 'tpo') return;
  if (requester.role === 'company_hr') {
    const hr = await CompanyHR.findOne({ userId: requester._id });
    if (hr && drive.companyId.equals(hr.companyId)) return;
  }
  throw ApiError.forbidden('You do not have permission to manage this drive');
}

async function createDrive(io, data, requester) {
  const company = await Company.findById(data.companyId);
  if (!company) throw ApiError.notFound('Company not found');
  if (company.verificationStatus !== 'approved' && requester.role !== 'tpo' && requester.role !== 'admin') {
    throw ApiError.forbidden('Company must be approved before posting drives');
  }

  let createdByHR;
  if (requester.role === 'company_hr') {
    const hr = await CompanyHR.findOne({ userId: requester._id });
    if (!hr || !hr.companyId?.equals(data.companyId)) {
      throw ApiError.forbidden('You can only create drives for your own company');
    }
    createdByHR = hr._id;
  }

  const drive = await PlacementDrive.create({ ...data, createdByHR, status: 'draft', approvedByTPO: false });
  return drive;
}

async function listDrives(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};

  if (query.status) filter.status = query.status;
  if (query.role) filter.role = { $regex: query.role, $options: 'i' };
  if (query.location) filter.location = { $regex: query.location, $options: 'i' };
  if (query.minPackage) filter.ctc = { $gte: query.minPackage };
  if (query.branch) filter['eligibility.allowedBranches'] = query.branch;
  if (query.skills) filter.requiredSkills = { $in: query.skills.split(',').map((s) => s.trim()) };
  if (query.search) filter.$text = { $search: query.search };

  const [drives, total] = await Promise.all([
    PlacementDrive.find(filter).populate('companyId', 'name logoUrl').sort(sort).skip(skip).limit(limit),
    PlacementDrive.countDocuments(filter),
  ]);
  return { drives, meta: buildMeta({ page, limit, total }) };
}

async function getDriveById(id) {
  const drive = await PlacementDrive.findById(id).populate('companyId', 'name logoUrl website industry');
  if (!drive) throw ApiError.notFound('Drive not found');
  return drive;
}

async function updateDrive(id, updates, requester) {
  const drive = await PlacementDrive.findById(id);
  if (!drive) throw ApiError.notFound('Drive not found');
  await assertOwnsDrive(drive, requester);

  Object.assign(drive, updates);
  await drive.save();
  return drive;
}

async function deleteDrive(id, requester) {
  const drive = await PlacementDrive.findById(id);
  if (!drive) throw ApiError.notFound('Drive not found');
  await assertOwnsDrive(drive, requester);
  await drive.deleteOne();
}

/** Opens a drive (TPO approval) and notifies all eligible students. */
async function openDrive(io, id, requester) {
  const drive = await PlacementDrive.findById(id).populate('companyId', 'name');
  if (!drive) throw ApiError.notFound('Drive not found');
  if (requester.role === 'company_hr') await assertOwnsDrive(drive, requester);

  drive.status = 'open';
  drive.approvedByTPO = true;
  await drive.save();

  const eligibleStudents = await getEligibleStudents(drive);
  await notifyMany(
    io,
    eligibleStudents.map((s) => s.userId),
    {
      type: 'system',
      title: `New drive: ${drive.companyId.name}`,
      message: `${drive.companyId.name} has opened a new "${drive.role}" drive. Check eligibility and apply before the deadline.`,
      link: `/drives/${drive._id}`,
    }
  );

  return drive;
}

async function closeDrive(id, requester) {
  const drive = await PlacementDrive.findById(id);
  if (!drive) throw ApiError.notFound('Drive not found');
  await assertOwnsDrive(drive, requester);
  drive.status = 'closed';
  await drive.save();
  return drive;
}

async function getEligibleStudents(drive) {
  const filter = {
    cgpa: { $gte: drive.eligibility.minCgpa },
    liveBacklogs: { $lte: drive.eligibility.maxLiveBacklogs },
    historyBacklogs: { $lte: drive.eligibility.maxHistoryBacklogs },
    verificationStatus: 'verified',
  };
  if (drive.eligibility.allowedBranches?.length) filter.branchId = { $in: drive.eligibility.allowedBranches };
  if (drive.eligibility.allowedPassingYears?.length) filter.passingYear = { $in: drive.eligibility.allowedPassingYears };

  return Student.find(filter).select('userId rollNumber cgpa branchId passingYear');
}

async function listApplicants(id, requester, query) {
  const drive = await PlacementDrive.findById(id);
  if (!drive) throw ApiError.notFound('Drive not found');
  await assertOwnsDrive(drive, requester);

  const filter = { driveId: id };
  if (query.status) filter.status = query.status;

  const applications = await require('../models').Application.find(filter)
    .populate({ path: 'studentId', populate: [{ path: 'userId', select: 'name email' }, { path: 'branchId', select: 'name code' }] })
    .sort('-appliedAt');

  if (query.export === 'excel') {
    const rows = applications.map((a) => ({
      Name: a.studentId?.userId?.name || '',
      Email: a.studentId?.userId?.email || '',
      RollNumber: a.studentId?.rollNumber || '',
      Branch: a.studentId?.branchId?.name || '',
      CGPA: a.studentId?.cgpa || '',
      Status: a.status,
      AppliedAt: a.appliedAt?.toISOString().slice(0, 10),
    }));
    return { isExport: true, buffer: buildExcelBuffer(rows, 'Applicants') };
  }

  return { isExport: false, applications };
}

module.exports = {
  createDrive,
  listDrives,
  getDriveById,
  updateDrive,
  deleteDrive,
  openDrive,
  closeDrive,
  getEligibleStudents,
  listApplicants,
  assertOwnsDrive,
};
