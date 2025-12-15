const PDFDocument = require('pdfkit');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Generate certificate PDF for event participation
 */
async function generateCertificate(registration, event, user) {
  return new Promise(async (resolve, reject) => {
    try {
      // Create PDF document in landscape mode
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });

      // Prepare output path
      const certificatesDir = path.join(process.env.UPLOAD_DIR || './uploads', 'certificates');
      if (!fs.existsSync(certificatesDir)) {
        fs.mkdirSync(certificatesDir, { recursive: true });
      }

      const filename = `certificate-${registration.id}-${Date.now()}.pdf`;
      const filepath = path.join(certificatesDir, filename);
      const writeStream = fs.createWriteStream(filepath);

      doc.pipe(writeStream);

      // Add decorative border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .strokeColor('#6C63FF')
         .stroke();

      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
         .lineWidth(1)
         .strokeColor('#6C63FF')
         .stroke();

      // Try to add logo
      try {
        const logoUrl = process.env.LOGO_URL;
        const logoResponse = await axios.get(logoUrl, { 
          responseType: 'arraybuffer',
          timeout: 5000 
        });
        const logoBuffer = Buffer.from(logoResponse.data);
        
        // Add logo at top center
        doc.image(logoBuffer, doc.page.width / 2 - 50, 60, { 
          width: 100,
          height: 100,
          fit: [100, 100],
          align: 'center'
        });
      } catch (error) {
        console.log('Could not load logo, continuing without it:', error.message);
        // Add text logo instead
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .fillColor('#6C63FF')
           .text('Campus Events', 0, 70, { align: 'center' });
      }

      // Add title
      doc.moveDown(5);
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#333333')
         .text('Certificate of Participation', 0, 180, { 
           align: 'center' 
         });

      // Add decorative line
      doc.moveDown(0.5);
      doc.moveTo(doc.page.width / 2 - 150, 230)
         .lineTo(doc.page.width / 2 + 150, 230)
         .lineWidth(2)
         .strokeColor('#FF6B6B')
         .stroke();

      // Add certificate text
      doc.moveDown(2);
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#555555')
         .text('This is to certify that', 0, 260, { 
           align: 'center' 
         });

      // Participant name (highlighted)
      doc.moveDown(1);
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#6C63FF')
         .text(user.name, 0, 300, { 
           align: 'center' 
         });

      // Event participation text
      doc.moveDown(1.5);
      doc.fontSize(18)
         .font('Helvetica')
         .fillColor('#555555')
         .text('has successfully participated in', 0, 360, { 
           align: 'center' 
         });

      // Event name (highlighted)
      doc.moveDown(1);
      doc.fontSize(26)
         .font('Helvetica-Bold')
         .fillColor('#FF6B6B')
         .text(event.title, 50, 400, { 
           align: 'center',
           width: doc.page.width - 100 
         });

      // Event date
      doc.moveDown(1.5);
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#777777')
         .text(`Date: ${formatDate(event.date)}`, 0, 460, { 
           align: 'center' 
         });

      // Certificate ID
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#999999')
         .text(`Certificate ID: CERT-${registration.id}-${event.id}`, 50, doc.page.height - 80, {
           align: 'left'
         });

      // Signature section
      const signatureY = doc.page.height - 120;
      
      doc.fontSize(14)
         .font('Helvetica-Oblique')
         .fillColor('#333333')
         .text('_____________________', doc.page.width - 250, signatureY);
      
      doc.fontSize(12)
         .font('Helvetica')
         .text('Event Organizer', doc.page.width - 250, signatureY + 25, {
           width: 200,
           align: 'center'
         });

      // Issue date
      doc.fontSize(12)
         .fillColor('#999999')
         .text(`Issued on: ${formatDate(new Date())}`, doc.page.width - 250, doc.page.height - 80, {
           align: 'right',
           width: 200
         });

      // Finalize PDF
      doc.end();

      // Wait for file to be written
      writeStream.on('finish', () => {
        resolve({
          filepath,
          filename,
          url: `/uploads/certificates/${filename}`
        });
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Format date for certificate
 */
function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  return new Date(date).toLocaleDateString('en-US', options);
}

module.exports = {
  generateCertificate
};
