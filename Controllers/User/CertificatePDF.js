const PDFDocument = require('pdfkit');
const fs = require('fs');
const axios = require("axios");
const transporter = require("./Transpoter");
const path = require("path");
const User = require("../../database/User");
const Certificate = require("../../database/Certificate")

const generateCertificate = async (userData, id) => {
  const doc = new PDFDocument({
    size: [1280, 720],
    margins: { top: 50, bottom: 50, left: 72, right: 72 }
  });

  const outputPath = path.join(__dirname, "certificate.pdf");

  // Ensure the temp folder exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const companyName = userData.companyInfoData.companyName;
  const startDate = new Date() || "N/A";

  // Move down before starting
  doc.moveDown(10);

  // Title
  doc
    .fillColor('#448EE4')
    .fontSize(30)
    .font('Helvetica-Bold')
    .text('CERTIFICATE OF ENROLLMENT', {
      align: 'center',
    })
    .moveDown(0.5);

  // Subtitle
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text('USDOT 49 CFR Part 40 & FMCSA Part 382.305 Random Drug and Alcohol', {
      align: 'center',
    })
    .moveDown(1);

  // Company Name in RED
  doc
    .fillColor('red')
    .fontSize(30)
    .font('Helvetica-Bold')
    .text(companyName, {
      align: 'center',
    })
    .moveDown(1);

  // Certificate Body Text
  doc
    .fillColor('#448EE4')
    .fontSize(18)
    .font('Helvetica')
    .text(`NDC hereby certifies that the named company is enrolled in a federally mandated random Drug and Alcohol testing program that meets the requirements as stated above, from ${startDate} till date.`, {
      align: 'center',
      indent: 20,
      lineGap: 4,
    })
    .moveDown(1.5);

  // Disclaimer
  doc
    .fontSize(10)
    .font('Helvetica')
    .text('(This certificate may be revoked during the period indicated herein and should not be relied on to verify USDOT Compliance)', {
      align: 'center',
      lineGap: 4,
    })
    .moveDown(3);

  // Footer - Signature Block
  doc
    .fillColor('red')
    .fontSize(10)
    .font('Helvetica-Bold')
    .text('NDC', { align: 'right' });

  doc
    .fillColor('#448EE4')
    .font('Helvetica')
    .text('Random Program Management Team', { align: 'right' })
    .text('(360)249-7511', { align: 'right' })
    .text('(206)571-7659', { align: 'right' })
    .text('www.nwdrugtesting.com', { align: 'right' })
    .text('info@ndctesting.com', { align: 'right' })
    .text('info@nwdrugtesting.com', { align: 'right' })
    .moveDown(2);

  // Decorative dashed line
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('black')
    .dash(5, { space: 5 })
    .stroke();

  // Finalize PDF
  doc.end();

  // Wait for stream to finish before sending email
  stream.on("finish", async () => {
    await sendEmailWithPDF(outputPath, userData.contactInfoData.email, companyName, id);

  });
};


// Function to send email with the PDF attachment
const sendEmailWithPDF = async (pdfPath, recipientEmail, companyName, userId) => {
  try {
    // 2. Read PDF as buffer
    const fileBuffer = fs.readFileSync(pdfPath);
    // 3. Set certificate dates
    const issueDate = new Date();
    const expirationDate = new Date();
    expirationDate.setFullYear(issueDate.getFullYear() + 1);

    // 4. Create new certificate (not $push into user!)
    await Certificate.create({
      user: userId, // Link certificate to user
      description: "Certificate",
      issueDate: issueDate,
      expirationDate: expirationDate,
      certificateFile: fileBuffer,
      filename: `${companyName}.pdf`,
      mimeType: 'application/pdf',
    });

  } catch (error) {
    console.error("Error sending email or saving certificate: ", error);
  }
};


module.exports = {
  generateCertificate,
};
