const bcrypt = require("bcrypt")
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { createCustomPDF } = require("./GenerateSignUpPDF")
const { createAgreementPDF } = require("./AgreementPDF")
const { generateCertificate } = require("./CertificatePDF");
const { sendWelcomeEmail } = require("./EmailTempletes/UserWelcoming")
const {sendAdminSignupNotification} = require("./EmailTempletes/AdminWelcoming")
const { getOrgId, getLocationCode } = require("./getLocationCodeAndOrgID");
const { sendResetEmail } = require("./EmailTempletes/ResetPassword")



const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const User = require("../../database/User");
const Admin = require("../../database/Admin");
const Agency = require("../../database/Agency");
const Setting = require("../../database/Setting")

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    let foundUser = null;
    let role = null;
    let savedPassword = null;

    // Search in User schema
    const user = await User.findOne({ "contactInfoData.email": email });
    if (user) {
      foundUser = user;
      savedPassword = user.contactInfoData.password;
      role = "User";
    }

    // Search in Admin schema
    if (!foundUser) {
      const admin = await Admin.findOne({ email });
      if (admin) {
        foundUser = admin;
        savedPassword = admin.password;
        role = "Admin";
      }
    }

    // Search in Agency schema
    if (!foundUser) {
      const agency = await Agency.findOne({ email });
      if (agency) {
        foundUser = agency;
        savedPassword = agency.password;
        role = "Agency";
      }
    }

    // If not found in any schema
    if (!foundUser) {
      return res.status(401).json({
        errorStatus: 1,
        message: "Incorrect email or password",
      });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, savedPassword);
    if (!isMatch) {
      return res.status(401).json({
        errorStatus: 1,
        message: "Incorrect email or password",
      });
    }

    // Generate token
    const token = jwt.sign(
      {
        id: foundUser._id,
        email,
        role,
      },
      JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      errorStatus: 0,
      message: "Login successful",
      token,
      role,
    });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

const signup = async (req, res) => {
  try {
    const { email } = req.body.contactInfoData;
    const agencyCode = req.body.companyInfoData.safetyAgencyName; // This is your agencyCode
    const companyName = req.body.companyInfoData.companyName; // Fixed typo

    // Check if email exists in any of the three collections
    const [existingUser, existingAdmin, existingAgency] = await Promise.all([
      User.findOne({ "contactInfoData.email": email }),
      Admin.findOne({ email }),
      Agency.findOne({ email }),
    ]);

    if (existingUser || existingAdmin || existingAgency) {
      return res.status(400).json({
        errorStatus: 1,
        message: "User already exists with this email!"
      });
    }

    // Create new user
    const newUser = new User(req.body);

    // Fetch settings to determine which actions to perform
    const settings = await Setting.findOne({}) || {};

    var orgId = null, locationCode = null
    if (settings.orgIdAndLocationCode) {
      orgId = await getOrgId(req.body);
      if (orgId !== null) {
        locationCode = await getLocationCode(req.body, orgId);
      }
    }
    const planPrice = req.body.Membership.selectedPlan === 1 ? 99 : req.body.Membership.selectedPlan === 2 ? 150 : 275;
    newUser.Membership.orgId = orgId;
    newUser.Membership.locationCode = locationCode;
    newUser.Membership.planName = getPlanName(req.body.Membership.selectedPlan);
    newUser.Membership.planStartDate = new Date();
    newUser.Membership.planEndDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

    await newUser.save();

    const userId = newUser._id;

    // ====== NEW: Assign this company to the agency if agencyCode is present ======
    if (agencyCode && agencyCode.trim() !== "") {
      const agency = await Agency.findOne({ agencyCode: agencyCode.trim() });
      if (agency) {
        // Prevent duplicate assignment
        const alreadyHandled = agency.handledCompanies.some(
          c => c._id.toString() === userId.toString()
        );
        if (!alreadyHandled) {
          agency.handledCompanies.push({
            _id: userId,
            name: companyName
          });
          await agency.save();
        }
      }
      // else: You might want to log if no agency found for the code
    }
    // ===========================================================================

    if (settings.sendCustomerPDF) {
      await createCustomPDF(req.body, userId);
    }
    if (settings.sendAgreementPDF) {
      await createAgreementPDF(req.body, userId, newUser.Membership.planName, planPrice);
    }
    if (settings.sendCertificatePDF) {
      await generateCertificate(req.body, userId);
    }
    if (settings.sendWelcomeEmail) {
      await sendWelcomeEmail(req.body);
    }
    await sendAdminSignupNotification(req.body)

    res.status(200).json({
      errorStatus: 0,
      message: "Account created Successfully!"
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "An unexpected error occurred. Please try again later."
    });
  }
};


function getPlanName(selectedPlan) {
  if (selectedPlan === 1 || selectedPlan === "1") return "NON-DOT Account";
  if (selectedPlan === 2 || selectedPlan === "2") return "1 Year Random Enrollment";
  if (selectedPlan === 3 || selectedPlan === "3") return "3 Year Random Enrollment";
  return "Unknown Plan";
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user in any of the 3 collections
    let user = await User.findOne({ "contactInfoData.email": email });
    let role = "User";

    if (!user) {
      user = await Admin.findOne({ email });
      role = "Admin";
    }

    if (!user) {
      user = await Agency.findOne({ email });
      role = "Agency";
    }

    // Respond generically whether or not the user exists
    if (!user) {
      return res.status(200).json({
        errorStatus: 0,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate token and expiry
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour

    // Set fields
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;

    // Gather name info
    let Name = "";
    let CompanyName = "";

    if (role === "User") {
      Name = `${user.contactInfoData.firstName} ${user.contactInfoData.lastName}`;
      CompanyName = user.companyInfoData.companyName || "";
    } else if (role === "Admin") {
      Name = `${user.firstName} ${user.lastName}`;
    } else if (role === "Agency") {
      Name = user.name;
    }

    // Send reset email
    await sendResetEmail({ email, resetToken, Name, CompanyName });

    // Save token
    await user.save();

    return res.status(200).json({
      errorStatus: 0,
      message: "If an account with that email exists, a password reset link has been sent.",
    });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      errorStatus: 1,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, token, password } = req.body;

    let user = await User.findOne({ "contactInfoData.email": email });
    let role = "User";

    if (!user) {
      user = await Admin.findOne({ email });
      role = "Admin";
    }

    if (!user) {
      user = await Agency.findOne({ email });
      role = "Agency";
    }

    if (!user) {
      return res.status(404).json({
        errorStatus: 1,
        message: "User not found",
      });
    }

    // Check token validity and expiration
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

    // Update the password field based on role
    if (role === "User") {
      user.contactInfoData.password = password;
    } else {
      user.password = password;
    }

    // Clear token and expiry
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    // Save the updated document
    await user.save();

    res.status(200).json({
      errorStatus: 0,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "An unexpected error occurred. Please try again later.",
    });
  }
};

module.exports = { login, signup, forgotPassword, resetPassword }