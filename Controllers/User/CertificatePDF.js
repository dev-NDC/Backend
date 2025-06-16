const PDFDocument = require('pdfkit');
const fs = require('fs');
const axios = require("axios");
const transporter = require("./Transpoter");
const path = require("path");
const User = require("../../database/schema");

const generateCertificate = async (userData, id) => {
  const doc = new PDFDocument({
    size: [1280, 720],
    margins: { top: 50, bottom: 50, left: 72, right: 72 }
  });

  const outputPath = path.join(__dirname, "temp", "certificate.pdf");

  // Ensure the temp folder exists
  if (!fs.existsSync(path.dirname(outputPath))) {
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  }

  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);

  const companyName = userData.companyInfoData.companyName;
  const startDate = userData.membership?.startDate || "N/A";

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

    // Optional: Delete the file after sending email
    fs.unlink(outputPath, (err) => {
      if (err) console.error("Error deleting certificate:", err);
    });
  });
};


// Function to send email with the PDF attachment
const sendEmailWithPDF = async (pdfPath, recipientEmail, companyName,userId) => {

  // Email options
  const mailOptions = {
    from: "your-email@gmail.com", // Sender address
    to: recipientEmail,           // Recipient's email address
    subject: `Certificate - ${companyName}`, // Subject line
    text: "Please find attached Certificate.", // Plain text body
    attachments: [
      {
        filename: `${companyName}.pdf`, // Name of the file attached
        path: pdfPath,          // Path to the generated PDF
      },
    ],
  };

  try {
    // Send email
    await transporter.sendMail(mailOptions);

    // Read PDF as buffer
    const fileBuffer = fs.readFileSync(pdfPath);

    const issueDate = new Date();
    const expirationDate = new Date();
    expirationDate.setFullYear(issueDate.getFullYear() + 1);

    await User.findByIdAndUpdate(userId, {
      $push: {
        certificates: {
          description: "Certificate",
          issueDate: issueDate,
          expirationDate: expirationDate,
          certificateFile: fileBuffer,
          filename: `${companyName}.pdf`,
          mimeType: 'application/pdf',
        }
      }
    });

  } catch (error) {
    console.error("Error sending email: ", error);
  }
};


module.exports = {
  generateCertificate,
};
