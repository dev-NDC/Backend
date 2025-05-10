const User = require("../../database/schema")
const transporter = require("./Transpoter")
const crypto = require("crypto");
const bcrypt = require("bcrypt");


const getAllAdminData = async (req, res) => {
    try {
        const admins = await User.find({ role: "Admin" });

        const formattedAdmins = admins.map((admin) => ({
            _id: admin._id,
            firstName: admin.contactInfoData.firstName || "",
            lastName: admin.contactInfoData.lastName || "",
            email: admin.contactInfoData.email || "",
            contactNumber: admin.contactInfoData.phone || "",
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "Admin data retrieved successfully",
            data: formattedAdmins,
        });
    } catch (error) {
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
        console.log("Contact Info Data:", contactInfoData);
        if (!contactInfoData || !contactInfoData._id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Missing admin ID or contact info"
            });
        }
        
        const { _id, firstName, lastName, email, contactNumber } = contactInfoData;

        const updatedUser = await User.findByIdAndUpdate(
            _id,
            {
                $set: {
                    "contactInfoData.firstName": firstName,
                    "contactInfoData.lastName": lastName,
                    "contactInfoData.email": email,
                    "contactInfoData.phone": contactNumber,
                    "companyInfoData.email": email
                }
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Admin not found"
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
            error: error.message
        });
    }
};

const deleteAdminAccount = async (req, res) => {
    try {
        const { adminId } = req.body;  // Get adminId from request body

        // Check if the adminId is provided
        if (!adminId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Admin ID is required"
            });
        }

        // Find the admin by ID and delete it
        const deletedAdmin = await User.findByIdAndDelete(adminId);

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

        // Check if admin already exists
        const existingAdmin = await User.findOne({ "contactInfoData.email": email });
        if (existingAdmin) {
            return res.status(409).json({
                errorStatus: 1,
                message: "Admin with this email already exists.",
            });
        }

        // Generate random password
        const randomPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Generate reset token and expiry (1 hour from now)
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000;  // Token expires in 1 hour

        // Create new admin user
        const newAdmin = new User({
            role: ["Admin"],
            contactInfoData: {
                firstName,
                lastName,
                email,
                phone: contactNumber,  // Mapping contact number
                password: hashedPassword,
            },
            companyInfoData: {
                companyEmail: email,  // Assuming the admin's company email is the same as their personal email
            },
            resetToken,  // Save reset token
            resetTokenExpiry,  // Save reset token expiry
        });

        // Generate reset link
        const resetLink = `http://localhost:3000/resetPassword?token=${resetToken}&email=${email}`;

        // Send reset email
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Set Your Password",
            html: `
                <h3>Welcome to the Admin Portal</h3>
                <p>You have been registered as an admin user.</p>
                <p>Please set your password using the link below:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 1 hour.</p>
            `,
        });

        // Save new admin to the database
        await newAdmin.save();

        res.status(201).json({
            errorStatus: 0,
            message: "Admin created and reset email sent.",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while creating admin",
            error: error.message,
        });
    }
};




module.exports = { getAllAdminData, updateAdminInformation, deleteAdminAccount, createNewAdmin};