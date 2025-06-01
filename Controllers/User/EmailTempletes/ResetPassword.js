const transporter = require("../Transpoter")
const fs = require('fs');
const path = require('path');


const sendResetEmail = async ({ email, resetToken }) => {
    try {
        const logoPath = path.join(__dirname, "logo.png");
        const logoBase64 = fs.readFileSync(logoPath).toString('base64');
        const logoDataURI = `data:image/png;base64,${logoBase64}`;
        console.log("Logo Data URI starts with:", logoDataURI.substring(0, 30));
        const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}&email=${email}`;

        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
                <div style="font-family: Arial, sans-serif; color: #000;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="http://localhost:8000/email-assets/logo.png" alt="Logo" style="max-width: 200px;" />
                    </div>
                    <p>Hi <strong>*COMPANY NAME*</strong>,</p>
                    <p>
                        You've been added to the application <strong>*APPNAME*</strong> as an admin.
                    </p>
                    <p>
                        Please click the button below to join and set your password. This link will expire in 24 hours.
                        Since we already made your account for you but didn't set a password, this takes you through the
                        Reset Password flow that a user would take if they had forgotten their password.
                    </p>
                    <p>
                        To request a new link, please go to <strong>*RESETLINK*</strong>, enter your email address, and click
                        "<strong>*REQUESTFIELDNAME*</strong>".
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #002b5c; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Set password
                        </a>
                    </div>
                    <p><strong>*APPNAME*</strong></p>
                    </div>
                </div>
            `
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Unable to sent password link, please try again later"
        })
    }
};

module.exports = { sendResetEmail };