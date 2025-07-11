const transporter = require("../Transpoter");
const fs = require('fs');
const path = require('path');

const sendWelcomeEmail = async (data) => {
  try {

    const recipientEmail = data.contactInfoData.email
    const customerName = data.contactInfoData.firstName + " " + data.contactInfoData.lastName
    const companyName = data.companyInfoData.companyName
    const certificatePDFPath = path.join(__dirname, '../certificate.pdf');
    const agreementPDFPath = path.join(__dirname, '../agreement.pdf');


    // Build the attachments array (add only if present)
    const attachments = [];
    if (certificatePDFPath && fs.existsSync(certificatePDFPath)) {
      attachments.push({
        filename: `${companyName}-Certificate.pdf`,
        path: certificatePDFPath
      });
    }
    if (agreementPDFPath && fs.existsSync(agreementPDFPath)) {
      attachments.push({
        filename: `${companyName}-Agreement.pdf`,
        path: agreementPDFPath
      });
    }

    await transporter.sendMail({
      from: `Nationwide Drug Centers (NDC) <${process.env.SMTP_USER}>`,
      to: recipientEmail,
      subject: `Welcome to Nationwide Drug Centers (NDC)`,
      html: `
      <div style="font-family: Arial, sans-serif; color: #000;">
        <div style="padding: 30px; background: #fff;">
          <p>Hi <strong>${customerName || "Customer"}</strong>,</p>
          <p>
            Welcome to <strong>Nationwide Drug Centers (NDC)</strong> – we’re excited to support your compliance and testing needs!
          </p>
          <p>
            Thank you for signing up. Your account is now active and ready to go. Whether you're a DOT-regulated business or simply prioritizing a safe workplace, we’re here to help you every step of the way.
          </p>
          <p><strong>Please see attached:</strong></p>
          <ul style="margin-top: 0;">
            ${certificatePDFPath ? "<li><strong>Your DOT Consortium Pool Enrollment Certificate.</strong></li>" : ""}
            ${agreementPDFPath ? "<li><strong>Your Service Agreement.</strong></li>" : ""}
          </ul>
          <p>
            These documents confirm your enrollment and outline the scope of services we provide under your account.
          </p>
          <p>Here’s what comes next:</p>
          <ul style="margin-top: 0;">
            <li>
              Access your <strong>online customer portal</strong> to view test results, manage your driver roster, and stay compliant: <br />
              <a href="https://nwdrugtesting.com" style="color: #1a73e8; text-decoration: none;">Customer Portal Login</a>
            </li>
            <li>
              Reach out if you need help with pre-employment tests, random selections, post-accident procedures, or anything else.
            </li>
          </ul>
          <p>
            If you have questions or need assistance, don’t hesitate to contact us:
          </p>
          <p style="margin: 6px 0;">📞 (360)249-7511</p>
          <p style="margin: 6px 0;">📧 <a href="mailto:info@nwdrugtesting.com" style="color: #1a73e8; text-decoration: none;">info@nwdrugtesting.com</a></p>
          <p>
            Thank you for choosing Nationwide Drug Centers. We’re proud to be your trusted partner in workplace safety and DOT compliance.
          </p>
          <p>Warm regards,</p>
          <p><strong>The NDC Team</strong><br />
          <a href="https://nwdrugtesting.com" style="color: #1a73e8; text-decoration: none;">www.nwdrugtesting.com</a></p>
          <img src="https://backend-pi8m.onrender.com/email-assets/logo.png" alt="Logo" style="max-width: 200px;" />
        </div>
      </div>
      `,
      attachments
    });
  } catch (error) {
    // You might want to log or throw
    console.error("Unable to send welcome email:", error);
  }
};

module.exports = { sendWelcomeEmail };
