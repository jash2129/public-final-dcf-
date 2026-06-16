import PDFDocument from 'pdfkit';

/**
 * Generates a PDF invoice dynamically and returns it as a Buffer.
 */
export function generateInvoiceBuffer(
  orderId: string,
  amount: number,
  userName: string,
  userEmail: string,
  serviceName: string
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Header Title
      doc.fontSize(20).font('Helvetica-Bold').text('DECCAN FILINGS', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('A product of TOR BUSINESS SOLUTIONS PRIVATE LIMITED', { align: 'center' });
      doc.moveDown(1.5);

      // Company Details
      doc.fontSize(10).font('Helvetica-Bold').text('TOR BUSINESS SOLUTIONS PRIVATE LIMITED', { align: 'left' });
      doc.font('Helvetica').text('GSTIN: 36AAKCT1792M1ZO');
      doc.text('Email: support@deccanfilings.com');
      doc.text('Website: www.deccanfilings.com');
      doc.moveDown(1);

      // Separator Line
      const yAfterCompany = doc.y;
      doc.moveTo(50, yAfterCompany).lineTo(562, yAfterCompany).stroke();
      doc.moveDown(1);

      // Title: INVOICE
      doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown(0.5);

      // Separator Line
      const yAfterInvoiceTitle = doc.y;
      doc.moveTo(50, yAfterInvoiceTitle).lineTo(562, yAfterInvoiceTitle).stroke();
      doc.moveDown(1);

      // Invoice Details
      const currentDate = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      doc.fontSize(10).font('Helvetica-Bold').text(`Invoice No: INV-${orderId}`);
      doc.font('Helvetica').text(`Date: ${currentDate}`);
      doc.text(`Billed To: ${userName}`);
      doc.text(`Email: ${userEmail}`);
      doc.moveDown(2);

      // Table Header
      const headerY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Service Description', 50, headerY, { width: 350 });
      doc.text('Amount (INR)', 400, headerY, { width: 162, align: 'right' });
      doc.moveDown(0.5);

      // Table Header Line
      const headerLineY = doc.y;
      doc.moveTo(50, headerLineY).lineTo(562, headerLineY).stroke();
      doc.moveDown(0.5);

      // Table Row
      const rowY = doc.y;
      doc.font('Helvetica');
      doc.text(serviceName, 50, rowY, { width: 350 });
      const formattedAmount = `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(formattedAmount, 400, rowY, { width: 162, align: 'right' });
      doc.moveDown(1);

      // Table Row Line
      const rowLineY = doc.y;
      doc.moveTo(50, rowLineY).lineTo(562, rowLineY).stroke();
      doc.moveDown(1);

      // Total Section
      const totalY = doc.y;
      doc.font('Helvetica-Bold');
      doc.text('Total Amount:', 300, totalY, { width: 100 });
      doc.text(formattedAmount, 400, totalY, { width: 162, align: 'right' });
      doc.moveDown(3);

      // Footer
      doc.fontSize(10).font('Helvetica-Oblique').text('Thank you for your business!', 50, 700, { align: 'center', width: 512 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
