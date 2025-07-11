const transporter = require("../Transpoter")


const scheduleUrlEmail = async (email, driverName, companyName, scheduleUrl, expirationTime) => {
    try {

        await transporter.sendMail({
            from: `Nationwide Drug Centers (NDC) ${process.env.SMTP_USER}`,
            to: email,
            subject: `Action Required: Schedule Your Drug Test  from ${companyName}`,
            html: `
                <body style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 20px; margin: 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #ddd; border-radius: 8px; padding: 30px;">
                        <tr>
                        <td align="center" style="padding-bottom: 20px;">
                            <!-- Top logo -->
                            <img src="https://backend-pi8m.onrender.com/email-assets/logo.png" alt="Nationwide Drug Centers Logo" style="max-width: 200px;" />
                        </td>
                        </tr>
                        <tr>
                        <td>
                            <p>Hi <strong>${driverName}</strong>,</p>

                            <p>
                            You are receiving this email because <strong>${companyName}</strong> requires you to complete a drug screening at a testing location of your choice.
                            </p>

                            <p><strong>🕒 Deadline:</strong> Your drug screen must be completed by <strong>${expirationTime}</strong>.</p>

                            <div style="text-align: center; margin: 30px 0;">
                            <a href=${scheduleUrl} target="_blank" style="background-color: #002b5c; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                                Schedule Now
                            </a>
                            </div>

                            <h3 style="color: #002b5c;">Please Note Before Scheduling:</h3>
                            <ul>
                            <li>Clinic hours vary – we recommend calling the facility ahead of time to confirm drug testing availability.</li>
                            <li>Most locations have dedicated drug testing hours and may experience high volume.</li>
                            <li>Please arrive at least <strong>1 hour before the clinic closes</strong> to allow enough time to complete the collection process.</li>
                            <li>The drug screen must be completed <strong>no later than the deadline</strong> listed above.</li>
                            </ul>

                            <p>Once your appointment is scheduled, you will receive an email with your <strong>Donor Pass</strong>. Please bring this pass to your test – the <strong>barcode must be clearly visible</strong> for the collector to scan.</p>

                            <h3 style="color: #002b5c;">Need Help?</h3>
                            <p>If you have any trouble scheduling, please contact our support team at <strong>(360) 249-7511 – Option #1</strong>.</p>

                            <p>Thank you,</p>
                            <p>
                            <strong>Nationwide Drug Centers</strong><br/>
                            📧 <a href="mailto:info@nwdrugtesting.com">info@nwdrugtesting.com</a><br/>
                            🌐 <a href="https://www.nwdrugtesting.com" target="_blank">www.nwdrugtesting.com</a><br/>
                            📞 (360) 249-7511
                            </p>

                            <!-- Signature logo -->
                            <div style="margin-top: 20px;">
                            <img src="https://backend-pi8m.onrender.com/email-assets/logo.png" alt="NDC Logo" style="max-width: 150px;" />
                            </div>
                        </td>
                        </tr>
                    </table>
                    </body>

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

module.exports = { scheduleUrlEmail };