const { Student, Application, OfferLetter, PlacementDrive, Branch } = require('../models');

async function overview() {
  const [totalStudents, placedStudents, offerStats, branchWise] = await Promise.all([
    Student.countDocuments({}),
    Student.countDocuments({ placementStatus: { $in: ['placed', 'multiple_offers'] } }),
    OfferLetter.aggregate([
      { $group: { _id: null, avgCtc: { $avg: '$ctc' }, maxCtc: { $max: '$ctc' }, count: { $sum: 1 } } },
    ]),
    Student.aggregate([
      {
        $group: {
          _id: '$branchId',
          total: { $sum: 1 },
          placed: { $sum: { $cond: [{ $in: ['$placementStatus', ['placed', 'multiple_offers']] }, 1, 0] } },
        },
      },
      { $lookup: { from: 'branches', localField: '_id', foreignField: '_id', as: 'branch' } },
      { $unwind: { path: '$branch', preserveNullAndEmptyArrays: true } },
      { $project: { branchName: '$branch.name', total: 1, placed: 1, _id: 0 } },
    ]),
  ]);

  const unplacedStudents = totalStudents - placedStudents;
  const placementPercentage = totalStudents ? Math.round((placedStudents / totalStudents) * 100) : 0;
  const companiesVisited = await PlacementDrive.distinct('companyId', { status: { $in: ['open', 'closed'] } });

  return {
    totalStudents,
    placedStudents,
    unplacedStudents,
    placementPercentage,
    companiesVisited: companiesVisited.length,
    highestPackage: offerStats[0]?.maxCtc || 0,
    averagePackage: Math.round((offerStats[0]?.avgCtc || 0) * 100) / 100,
    branchWise,
  };
}

async function trends() {
  return OfferLetter.aggregate([
    {
      $group: {
        _id: { year: { $year: '$issuedAt' }, month: { $month: '$issuedAt' } },
        count: { $sum: 1 },
        totalCtc: { $sum: '$ctc' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $project: { year: '$_id.year', month: '$_id.month', count: 1, avgCtc: { $divide: ['$totalCtc', '$count'] }, _id: 0 } },
  ]);
}

async function topRecruiters(limit = 10) {
  return OfferLetter.aggregate([
    {
      $lookup: {
        from: 'placementdrives',
        localField: 'driveId',
        foreignField: '_id',
        as: 'drive',
      },
    },
    { $unwind: '$drive' },
    { $group: { _id: '$drive.companyId', hires: { $sum: 1 }, totalCtc: { $sum: '$ctc' } } },
    { $sort: { hires: -1 } },
    { $limit: limit },
    { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'company' } },
    { $unwind: '$company' },
    { $project: { companyName: '$company.name', logoUrl: '$company.logoUrl', hires: 1, avgCtc: { $divide: ['$totalCtc', '$hires'] }, _id: 0 } },
  ]);
}

async function applicationFunnel() {
  const [eligible, applied, selected, rejected] = await Promise.all([
    Student.countDocuments({ verificationStatus: 'verified' }),
    Application.countDocuments({ status: { $ne: 'withdrawn' } }),
    Application.countDocuments({ status: 'selected' }),
    Application.countDocuments({ status: 'rejected' }),
  ]);
  return { eligible, applied, selected, rejected };
}

module.exports = { overview, trends, topRecruiters, applicationFunnel };
