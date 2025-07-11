const transporter = require("../Transpoter")
const fs = require('fs');
const path = require('path');


const sendResetEmail = async ({ email, resetToken, Name, CompanyName}) => {
    try {
        const resetLink = `https://nwdrugtesting.com/resetPassword?token=${resetToken}&email=${email}`;

        await transporter.sendMail({
            from: `Nationwide Drug Centers (NDC) <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Password Reset Link",
            html: `
                <div style="font-family: Arial, sans-serif; color: #000;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 30px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://backend-pi8m.onrender.com/email-assets/logo.png" alt="Logo" style="max-width: 200px;" />
                    </div>
                    <p>Hi <strong>${Name}</strong>,</p>
                    <p>
                    you received a request to reset the password for your <strong>${CompanyName}</strong> account.
                    </p>
                    <p>
                    Click the button below to reset your password. This link will expire in <strong>1 hour</strong> for your security.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #002b5c; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                    </div>
                    <p>If you did not request a password reset, you can safely ignore this email.</p>
                    <p>Thanks,<br/><strong>NDC</strong></p>
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