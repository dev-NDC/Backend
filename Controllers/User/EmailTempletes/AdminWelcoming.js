const transporter = require("../Transpoter"); // Adjust path as needed
const fs = require('fs');
const path = require('path');


const sendAdminSignupNotification = async (data) => {
    try {
        const pdfPaths = [
            path.join(__dirname, '../certificate.pdf'),
            path.join(__dirname, '../agreement.pdf'),
            path.join(__dirname, '../custom.pdf')
        ];
        const adminEmail = process.env.ADMINEMAIL
        const customerName = `${data.contactInfoData.firstName || ""} ${data.contactInfoData.lastName || ""}`.trim();
        const companyName = data.companyInfoData.companyName || "-";
        const email = data.contactInfoData.email || "-";
        const phone = data.contactInfoData.phone || "-";
        const dotNumber = data.companyInfoData.usdot || "-";
        const signupTime = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });

        // Build the attachments array from all present files
        const attachments = [];
        for (const filePath of pdfPaths) {
            if (filePath && fs.existsSync(filePath)) {
                attachments.push({
                    filename: path.basename(filePath),
                    path: filePath
                });
            }
        }

        await transporter.sendMail({
            from: `NDC Admin Notification <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: "New Customer Signup Notification",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>New Customer Signup Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; font-size: 15px; color: #000; margin: 0; padding: 20px; background-color: #fff;">
            <p>Hi Team,</p>
            <p>
              A new customer has just signed up on the <strong>Nationwide Drug Centers</strong> website.
            </p>
            <p>Here are the details:</p>
            <p style="margin: 8px 0;"><strong>Customer Name:</strong> ${customerName}</p>
            <p style="margin: 8px 0;"><strong>Company Name:</strong> ${companyName}</p>
            <p style="margin: 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${phone}</p>
            <p style="margin: 8px 0;"><strong>DOT Number (if provided):</strong> ${dotNumber}</p>
            <p style="margin: 8px 0;"><strong>Date/Time of Signup:</strong> ${signupTime}</p>
            <p style="margin-top: 20px;"><strong>Next Steps:</strong></p>
            <ul style="list-style: none; padding-left: 0;">
              <li style="margin: 6px 0;">✅ Verify account details in the system</li>
              <li style="margin: 6px 0;">✅ Ensure they are added to the correct <strong>DOT random testing pool</strong></li>
              <li style="margin: 6px 0;">✅ Email their <strong>Enrollment Certificate</strong> and <strong>Service Agreement</strong> (if not auto-sent).</li>
              <li style="margin: 6px 0;">✅ Follow up within 24 hours if manual onboarding is needed.</li>
            </ul>
            <p style="margin-top: 20px;">
              🔗 <a href="https://admin.ndc.com" style="color: #1a73e8; text-decoration: none;">View in Admin Portal</a>
            </p>
            <p>Let’s make sure their experience with us starts off smoothly!</p>
            <p style="margin-top: 20px;">Best,<br /><strong>NDC Admin System</strong></p>
          </body>
        </html>
      `,
            attachments
        });

        // Remove files after sending (if you want)
        for (const filePath of pdfPaths) {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    } catch (error) {
        console.error("Unable to send admin signup notification:", error);
    }
};

module.exports = { sendAdminSignupNotification };
