const bcrypt = require("bcrypt")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const transporter = require("./Transpoter")
const { createCustomPDF } = require("./GenerateSignUpPDF")
const { getOrgId, getLocationCode } = require("./getLocationCodeAndOrgID");


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const User = require("../../database/schema")


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Email and password are required."
            });
        }

        const user = await User.findOne({ "contactInfoData.email": email });
        if (!user) {
            return res.status(401).json({
                errorStatus: 1,
                message: "Incorrect email or password",
            });
        }

        const savedPassword = user.contactInfoData.password;
        const isMatch = await bcrypt.compare(password, savedPassword);
        if (!isMatch) {
            return res.status(401).json({
                errorStatus: 1,
                message: "Incorrect email or password",
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.contactInfoData.email, role: user.role },
            JWT_SECRET_KEY,
            { expiresIn: "30d" }
        );

        res.status(200).json({
            errorStatus: 0,
            message: "Login successful",
            token,
            role: user.role,
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: 'Server error, please try again later'
        });
    }
};

const signup = async (req, res) => {
    try {
        const { email } = req.body.contactInfoData;
        const exitingUser = await User.findOne({ "contactInfoData.email": email })
        if (exitingUser) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User already exists with this email!"
            });
        }
        const newUser = new User(req.body);

        const orgId = await getOrgId(req.body);
        const locationCode = await getLocationCode(req.body);
        newUser.Membership.orgId = orgId;
        newUser.Membership.locationCode = locationCode;
        await newUser.save();
        createCustomPDF(req.body);
        res.status(200).json({
            errorStatus: 0,
            message: "Account created Successfully"
        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "Failed to Signup"
        })
    }

}


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ "contactInfoData.email": email });

        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        // Generate reset token and expiry time (1 hour expiry)
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

        // Save token and expiry in the user's document
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;

        // Send reset email (example logic)
        const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}&email=${email}`;
        // Send reset email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Password Reset Request",
            html: `
            <h3>Password Reset Request</h3>
            <p>We received a request to reset your password. Click the link below to reset it:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
        `,
        });

        await user.save();
        res.status(200).json({
            errorStatus: 0,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to send password reset link",
            error: error.message,
        });
    }
};


const resetPassword = async (req, res) => {
    try {
        const { email, token, password } = req.body;

        const user = await User.findOne({ "contactInfoData.email": email });

        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        // Check if the token is valid and hasn't expired
        if (
            !user.resetToken ||
            user.resetToken !== token ||
            !user.resetTokenExpiry ||
            user.resetTokenExpiry < Date.now()
        ) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Invalid or expired token",
            });
        }

        // Update the password directly
        user.contactInfoData.password = password; // Don't hash it here

        // Clear reset token and expiry
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;

        // Save the user document, the password will be hashed automatically due to the pre-save hook in the schema
        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Password reset successful",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to reset password",
            error: error.message,
        });
    }
};


module.exports = { login, signup, forgotPassword, resetPassword }