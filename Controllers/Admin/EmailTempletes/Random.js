const transporter = require("../Transpoter");

const RandomDriver = async (email, ccEmail, data ) => {
  try {
    // Build mail options
    const mailOptions = {
      from: `Nationwide Drug Centers (NDC) <${process.env.SMTP_USER}>`,
      to: email,
      subject: `${data.year} Random Selection Notice for ${data?.company?.name || "Unknown"}`,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <title>${data.year} Random Selections Notice</title>
        </head>
        <body style="margin: 0; font-family: Arial, sans-serif; background-color: #f7f7f7; color: #000;">
          <div style="background-color: #4285f4; padding: 30px 20px; text-align: center;">
            <img src="https://backend-pi8m.onrender.com/email-assets/logo.png" alt="NDC Logo" style="height: 80px; object-fit: contain; display: block; margin: 0 auto 10px; background-color: white; border-radius: 4px; padding: 5px;" />
          </div>
          <div style="max-width: 700px; margin: 30px auto; background-color: #f7f7f7; padding: 0 30px; text-align: center;">
            <h2 style="color: #4285f4; margin-bottom: 5px;">${data.year} RANDOM SELECTIONS NOTICE</h2>
            <h3 style="color: red; margin: 10px 0;">${data.quarter} </h3>
            <p>Hello <strong>${data?.company?.name || "Unknown"}</strong>,</p>
            <p>
              The following driver has been chosen for Q${data.quarter} ${data.year} DOT Random Pool. Please complete this
              random test ASAP. In order to stay compliant with DOT Rule 49 CFR Part 40 Section 40.191,
              this test needs to be completed as soon as possible.
            </p>
            <div style="text-align: left; display: inline-block; margin-bottom: 20px;">
              <ol style="padding-left: 20px;">
                <li style="color: red; font-weight: bold; margin-bottom: 8px;">
                  ${data?.driver?.name} - ${data?.testType || "Unknown"}
                </li>
              </ol>
            </div>
            <p>
              Please call us at <strong>(360)249-7511</strong> or reply to this email with a Zip code to schedule your random test.
            </p>
            <p>
              <strong>Random Consortium Department</strong><br>
              <a href="mailto:info@ndctesting.com">info@ndctesting.com</a>
            </p>
          </div>
          <div style="background-color: #4285f4; padding: 30px 20px; text-align: center; color: white; font-size: 14px; line-height: 1.6;">
            <div><strong>NATIONWIDE DRUG CENTERS</strong></div>
            <div>3055 NW YEON AVE UNTT#271<br>Portland, OR 97210</div>
            <div>(360)249-7511<br>(206)571-7659</div>
            <div><a href="https://www.nwdrugtesting.com" target="_blank" style="color: white; text-decoration: underline;">www.nwdrugtesting.com</a></div>
          </div>
        </body>
        </html>
      `
    };

    // Add cc field if ccEmail is present and not empty
    if (ccEmail && ccEmail.trim() !== "") {
      mailOptions.cc = ccEmail;
    }

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("RandomDriver Email Error:", error);
  }
};

module.exports = { RandomDriver };
