const User = require("../../database/UserSchema");
const Admin = require("../../database/AdminSchema");
const Agency = require("../../database/AgencySchema");

const crypto = require("crypto");
const bcrypt = require("bcrypt");

const {newAdmin} = require("./EmailTempletes/NewAdmin")

const getAllAdminData = async (req, res) => {
  try {
    // Fetch all admins
    const admins = await Admin.find({}, "firstName lastName email contact");

    const formattedAdmins = admins.map((admin) => ({
      _id: admin._id,
      firstName: admin.firstName || "",
      lastName: admin.lastName || "",
      email: admin.email || "",
      contactNumber: admin.contact || "",
    }));

    res.status(200).json({
      errorStatus: 0,
      message: "Admin data retrieved successfully",
      data: formattedAdmins,
    });
  } catch (error) {
    console.error("getAllAdminData error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message,
    });
  }
};


const updateAdminInformation = async (req, res) => {
  try {
    const { contactInfoData } = req.body;

    if (!contactInfoData || !contactInfoData._id) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Missing admin ID or contact info",
      });
    }

    const { _id, firstName, lastName, email, contactNumber } = contactInfoData;

    const updatedAdmin = await Admin.findByIdAndUpdate(
      _id,
      {
        $set: {
          firstName,
          lastName,
          email,
          contact: contactNumber,
        },
      },
      { new: true }
    );

    if (!updatedAdmin) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Admin not found",
      });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "Admin information updated successfully",
    });

  } catch (error) {
    console.error("Error updating admin info:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message,
    });
  }
};


const deleteAdminAccount = async (req, res) => {
  try {
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        errorStatus: 1,
        message: "Admin ID is required"
      });
    }

    const deletedAdmin = await Admin.findByIdAndDelete(adminId);

    if (!deletedAdmin) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Admin not found"
      });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "Admin deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error, please try again later",
      error: error.message
    });
  }
};


const createNewAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email, contactNumber } = req.body;

    // Check if the email exists in any model
    const [existingUser, existingAgency, existingAdmin] = await Promise.all([
      User.findOne({ "contactInfoData.email": email }),
      Agency.findOne({ email }),
      Admin.findOne({ email }),
    ]);

    if (existingUser || existingAgency || existingAdmin) {
      return res.status(409).json({
        errorStatus: 1,
        message: "Admin with this email already exists.",
      });
    }

    // Generate a random password and hash it
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Generate reset token and expiry
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Create and save new admin
    const newAdminDoc = new Admin({
      firstName,
      lastName,
      email,
      contact: contactNumber,
      password: hashedPassword,
      resetToken,
      resetTokenExpiry,
    });

    await newAdminDoc.save();

    // Send reset email
    const Name = `${firstName} ${lastName}`;
    await newAdmin({ email, resetToken, Name });

    res.status(201).json({
      errorStatus: 0,
      message: "Admin created and reset email sent.",
    });
  } catch (error) {
    console.error("createNewAdmin error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while creating admin",
      error: error.message,
    });
  }
};


module.exports = { getAllAdminData, updateAdminInformation, deleteAdminAccount, createNewAdmin};