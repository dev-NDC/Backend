const transporter = require("../Transpoter")


const newAgencyEmail = async (email, resetToken, Name ) => {
    try {
        const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}&email=${email}`;

        await transporter.sendMail({
            from: `Nationwide Drug Centers (NDC) <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Your Agency has been invited by Nationwide Drug Center",
            html: `
                <div style="font-family: Arial, sans-serif; color: #000;">
                <div style="max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; padding: 30px; background: #fff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://backend-pi8m.onrender.com/email-assets/logo.png" alt="Logo" style="max-width: 200px;" />
                    </div>
                    <p>Hi <strong>${Name}</strong>,</p>
                    <p>
                    You've been added as an <strong>Agency</strong> to the <strong>NDC</strong> account.
                    </p>
                    <p>
                    To complete your setup, please click the button below to set your password and activate your account.
                    This link will expire in <strong>1 hour</strong> for security reasons.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #002b5c; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Set Your Password
                    </a>
                    </div>
                    <p>If you were not expecting this invitation, you can ignore this email.</p>
                    <p>Thanks,<br/><strong>NDC Team</strong></p>
                </div>
                </div>

            `
        });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            errorStatus: 1,
            message: "Unable to sent password link, please try again later"
        })
    }
};

module.exports = { newAgencyEmail };