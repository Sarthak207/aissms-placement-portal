const XLSX = require('xlsx');

/**
 * Converts an array of plain objects into an Excel workbook buffer.
 * rows: [{ col1: val, col2: val }, ...]
 */
function buildExcelBuffer(rows, sheetName = 'Sheet1') {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

module.exports = { buildExcelBuffer };
