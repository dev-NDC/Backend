const bcrypt = require("bcrypt")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createCustomPDF } = require("./GenerateSignUpPDF")
const { createAgreementPDF } = require("./AgreementPDF")
const { generateCertificate } = require("./CertificatePDF");
const { getOrgId, getLocationCode } = require("./getLocationCodeAndOrgID");
const { sendResetEmail } = require("./EmailTempletes/ResetPassword")


const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const User = require("../../database/schema");


const login = async (req, res) => {
    try {
        const { email, password } = req.body;
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
            message: "An unexpected error occurred. Please try again later.",
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
        let locationCode = null;
        if (orgId !== null) {
            locationCode = await getLocationCode(req.body, orgId);
        }
        newUser.Membership.orgId = orgId;
        newUser.Membership.locationCode = locationCode;
        await newUser.save();

        const userId = newUser._id

        createCustomPDF(req.body, userId);
        createAgreementPDF(req.body, userId);
        generateCertificate(req.body, userId);
        res.status(200).json({
            errorStatus: 0,
            message: "Account created Successfully!"
        })
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "An unexpected error occurred. Please try again later."
        })
    }

}


const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ "contactInfoData.email": email });

        if (!user) {
            return res.status(200).json({
                errorStatus: 0,
                message: "If an account with that email exists, a password reset link has been sent.",
            });
        }
        const Name = `${user.contactInfoData.firstName} ${user.contactInfoData.lastName}`
        const CompanyName = `${user.companyInfoData.companyName}`
        // Generate reset token and expiry time (1 hour expiry)
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

        // Save token and expiry in the user's document
        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;

        await sendResetEmail({ email, resetToken, Name, CompanyName });


        await user.save();
        res.status(200).json({
            errorStatus: 0,
            message: "If an account with that email exists, a password reset link has been sent.",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "An unexpected error occurred. Please try again later.",
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
                message: "Invalid or expired password reset token",
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
            message: "An unexpected error occurred. Please try again later.",
        });
    }
};


module.exports = { login, signup, forgotPassword, resetPassword }