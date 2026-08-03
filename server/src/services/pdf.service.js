const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

/**
 * Generates a simple, professional offer-letter PDF and returns it as a Buffer.
 */
async function generateOfferLetterPdf({ studentName, companyName, role, ctc, joiningDetails = '' }) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const { height } = page.getSize();
  let y = height - 80;

  const drawText = (text, opts = {}) => {
    page.drawText(text, { x: 50, y, size: opts.size || 12, font: opts.bold ? bold : font, color: rgb(0, 0, 0) });
    y -= opts.gap || 24;
  };

  drawText('AISSMS College — Placement Cell', { size: 18, bold: true, gap: 30 });
  drawText('Offer of Employment', { size: 14, bold: true, gap: 30 });
  drawText(`Dear ${studentName},`, { gap: 24 });
  drawText(
    `We are pleased to offer you the position of "${role}" at ${companyName}, extended through the`,
    { gap: 18 }
  );
  drawText('AISSMS College campus placement process.', { gap: 30 });
  drawText(`Company: ${companyName}`, { gap: 20 });
  drawText(`Role: ${role}`, { gap: 20 });
  drawText(`CTC: ${ctc} LPA`, { gap: 20 });
  if (joiningDetails) drawText(`Joining Details: ${joiningDetails}`, { gap: 20 });
  y -= 20;
  drawText('Congratulations on your selection!', { gap: 24 });
  drawText('Placement Cell, AISSMS College, Pune', { gap: 18 });
  drawText(`Issued on: ${new Date().toLocaleDateString()}`, { gap: 18, size: 10 });

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

/**
 * Generates a tabular PDF report (e.g. placement statistics) from rows of data.
 */
async function generateTablePdf({ title, columns, rows }) {
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([842, 595]); // A4 landscape
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();

  let y = height - 60;
  page.drawText(title, { x: 40, y, size: 16, font: bold });
  y -= 30;

  const colWidth = (width - 80) / columns.length;
  columns.forEach((col, i) => {
    page.drawText(String(col), { x: 40 + i * colWidth, y, size: 10, font: bold });
  });
  y -= 18;

  for (const row of rows) {
    if (y < 40) {
      page = pdfDoc.addPage([842, 595]);
      y = height - 60;
    }
    columns.forEach((col, i) => {
      page.drawText(String(row[col] ?? ''), { x: 40 + i * colWidth, y, size: 9, font });
    });
    y -= 16;
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}

module.exports = { generateOfferLetterPdf, generateTablePdf };
