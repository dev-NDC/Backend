const User = require("../../database/schema")
const transporter = require("./Transpoter")
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const getCompanyList = async (req, res) => {
    try {
        const users = await User.find(
            { role: ["User"] },
            "companyInfoData.companyName"
        );

        const companies = users
            .filter(u => u.companyInfoData?.companyName)
            .map(u => ({
                userId: u._id,
                companyName: u.companyInfoData.companyName
            }));
        res.status(200).json({
            errorStatus: 0,
            message: "Companies retrieved successfully",
            data: companies
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to fetch companies",
            error: error.message
        });
    }
};


const getAllAgencyData = async (req, res) => {
    try {
        // Get all users that have 'agency' in their roles
        const agencies = await User.find(
            { role: ['Agency'] },
            "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName handledCompanies"
        );

        // Format agency data and count handledCompanies
        const formattedAgencies = agencies.map(agency => ({
            agencyName: agency.companyInfoData?.companyName || "N/A",
            agencyEmail: agency.companyInfoData?.companyEmail || "N/A",
            agencyContactNumber: agency.companyInfoData?.contactNumber || "N/A",
            numberOfCompanies: agency.handledCompanies?.length || 0,
            id: agency._id
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "Agency data retrieved successfully",
            data: formattedAgencies
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};


const getSingleAgencyData = async (req, res) => {
    try {
        const agencyId = req.body.id;

        const agency = await User.findOne(
            { _id: agencyId, role: { $in: ['Agency'] } },
            "companyInfoData handledCompanies"
        );

        if (!agency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }

        const response = {
            agencyName: agency.companyInfoData?.companyName || "N/A",
            agencyEmail: agency.companyInfoData?.companyEmail || "N/A",
            agencyContactNumber: agency.companyInfoData?.contactNumber || "N/A",
            numberOfCompanies: agency.handledCompanies?.length || 0,
            handledCompanies: agency.handledCompanies?.map(company => ({
                userId: company._id,
                companyName: company.name || "Unnamed Company"
            })),
            id: agency._id
        };

        res.status(200).json({
            errorStatus: 0,
            message: "Agency details fetched successfully",
            data: response
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};



const updateAgencyData = async (req, res) => {
    try {
        const { data } = req.body;
        const currentId = data._id
        const agency = await User.findById(currentId);

        if (!agency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }
        if (!agency.role.includes('Agency')) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Provided user does not have 'Agency' role",
            });
        }

        agency.companyInfoData.companyName = data.agencyName;
        agency.companyInfoData.companyEmail = data.agencyEmail;
        agency.companyInfoData.contactNumber = data.agencyContactNumber;


        const handledUserIds = data.handledCompanies.map(c => c.userId);
        console.log*("Handled User IDs:", handledUserIds);
        const validUsers = await User.find({
            _id: { $in: handledUserIds },
            role: ['User'] // Ensures exactly ['User']
        }).select('_id companyInfoData.companyName');


        // Save as subdocuments with _id and name
        agency.handledCompanies = validUsers.map(u => ({
            _id: u._id,
            name: u.companyInfoData?.companyName || 'Unnamed Company',
        }));

        await agency.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Agency information saved successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Failed to save information",
            error: error.message,
        });
    }
};



const createNewAgency = async (req, res) => {
    try {
        const { email, agencyName, contactNumber } = req.body;

        // Check for existing agency
        const existingUser = await User.findOne({ "contactInfoData.email": email });
        if (existingUser) {
            return res.status(409).json({
                errorStatus: 1,
                message: "Agency with this email already exists.",
            });
        }

        // Generate random password
        const randomPassword = crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        // Generate reset token and expiry (1 hour from now)
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetTokenExpiry = Date.now() + 3600000;  // Token expires in 1 hour

        // Create new agency user
        const newAgency = new User({
            role: ["Agency"],
            contactInfoData: {
                email,
                phone: contactNumber,  // Mapping contact number
                password: hashedPassword,
            },
            companyInfoData: {
                companyName: agencyName,       // Save agencyName
                contactNumber: contactNumber,    // Save contactNumber
                companyEmail: email,
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
                <h3>Welcome to the Agency Portal</h3>
                <p>You have been registered as an agency user.</p>
                <p>Please set your password using the link below:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire in 1 hour.</p>
            `,
        });

        // Save new agency to the database
        await newAgency.save();

        res.status(201).json({
            errorStatus: 0,
            message: "Agency created and reset email sent.",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while creating agency",
            error: error.message,
        });
    }
};




module.exports = { getAllAgencyData, getSingleAgencyData, getCompanyList, updateAgencyData, createNewAgency };