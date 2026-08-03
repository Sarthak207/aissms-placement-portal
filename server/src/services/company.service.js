const { Company, CompanyHR, Student } = require('../models');
const ApiError = require('../utils/apiError');
const { parsePagination, buildMeta } = require('../utils/pagination');
const { notify } = require('./notification.service');

async function createCompany(hrUserId, data) {
  const hr = await CompanyHR.findOne({ userId: hrUserId });
  if (!hr) throw ApiError.forbidden('Only registered Company HR accounts can create a company');

  const company = await Company.create({ ...data, verificationStatus: 'pending', createdByHR: hr._id });
  hr.companyId = company._id;
  await hr.save();
  return company;
}

async function listCompanies(query) {
  const { page, limit, skip, sort } = parsePagination(query);
  const filter = {};
  if (query.verificationStatus) filter.verificationStatus = query.verificationStatus;
  if (query.search) filter.name = { $regex: query.search, $options: 'i' };

  const [companies, total] = await Promise.all([
    Company.find(filter).sort(sort).skip(skip).limit(limit),
    Company.countDocuments(filter),
  ]);
  return { companies, meta: buildMeta({ page, limit, total }) };
}

async function getCompanyById(id) {
  const company = await Company.findById(id);
  if (!company) throw ApiError.notFound('Company not found');
  return company;
}

async function updateCompany(id, requester, updates) {
  const company = await Company.findById(id);
  if (!company) throw ApiError.notFound('Company not found');

  if (requester.role === 'company_hr') {
    const hr = await CompanyHR.findOne({ userId: requester._id });
    if (!hr || !hr.companyId?.equals(company._id)) {
      throw ApiError.forbidden('You can only update your own company profile');
    }
  }

  Object.assign(company, updates);
  await company.save();
  return company;
}

async function approveCompany(io, id, { status }, actor) {
  const company = await Company.findById(id);
  if (!company) throw ApiError.notFound('Company not found');

  company.verificationStatus = status;
  await company.save();

  const hr = await CompanyHR.findOne({ companyId: company._id }).populate('userId', 'name email');
  if (hr?.userId) {
    if (status === 'approved') {
      hr.isApproved = true;
      await hr.save();
    }
    await notify(io, {
      userId: hr.userId._id,
      type: 'system',
      title: `Company ${status}`,
      message: `Your company "${company.name}" has been ${status} by the placement cell.`,
      email: hr.userId.email,
    });
  }

  return company;
}

async function toggleBookmark(studentUserId, companyId) {
  const student = await Student.findOne({ userId: studentUserId });
  if (!student) throw ApiError.notFound('Student profile not found');

  const idx = student.bookmarkedCompanies.findIndex((c) => c.equals(companyId));
  if (idx >= 0) {
    student.bookmarkedCompanies.splice(idx, 1);
  } else {
    student.bookmarkedCompanies.push(companyId);
  }
  await student.save();
  return { bookmarked: idx < 0, bookmarkedCompanies: student.bookmarkedCompanies };
}

async function getMyCompany(hrUserId) {
  const hr = await CompanyHR.findOne({ userId: hrUserId }).populate('companyId');
  if (!hr || !hr.companyId) throw ApiError.notFound('No company associated with this account yet');
  return hr.companyId;
}

module.exports = { createCompany, listCompanies, getCompanyById, updateCompany, approveCompany, toggleBookmark, getMyCompany };
