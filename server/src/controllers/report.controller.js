const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/report.service');

function sendFile(res, { buffer, contentType, ext }, filename) {
  res.setHeader('Content-Disposition', `attachment; filename=${filename}.${ext}`);
  res.setHeader('Content-Type', contentType);
  return res.send(buffer);
}

const placementReport = asyncHandler(async (req, res) => {
  const format = req.query.format === 'excel' ? 'excel' : 'pdf';
  const rows = await reportService.placementReportRows();
  const file = await reportService.generateReport(rows, 'Placement Report', format);
  return sendFile(res, file, 'placement-report');
});

const branchReport = asyncHandler(async (req, res) => {
  const format = req.query.format === 'excel' ? 'excel' : 'pdf';
  const rows = await reportService.branchReportRows(req.params.branchId);
  const file = await reportService.generateReport(rows, 'Branch Report', format);
  return sendFile(res, file, 'branch-report');
});

module.exports = { placementReport, branchReport };
