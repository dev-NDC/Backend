const User = require("../../database/User");
const Driver = require("../../database/Driver");
const Result = require("../../database/Result")
const Invoice = require("../../database/Invoice");
const Certificate = require("../../database/Certificate");
const Document = require("../../database/Document");
const Random = require("../../database/Random");

const getAllUserData = async (req, res) => {
    try {
        // Fetch all users (only needed fields)
        const users = await User.find(
            {},
            "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName Membership"
        );

        // Get all driver counts by user in bulk to avoid N+1 queries
        const userIds = users.map(user => user._id);
        const drivers = await Driver.find({ user: { $in: userIds }, isDeleted: false, isActive: true }, "user");
        // Map userId -> active driver count
        const driverCounts = {};
        drivers.forEach(driver => {
            const uid = driver.user.toString();
            driverCounts[uid] = (driverCounts[uid] || 0) + 1;
        });

        // Transform data
        const formattedUsers = users.map(user => ({
            companyName: user.companyInfoData?.companyName || "N/A",
            companyEmail: user.companyInfoData?.companyEmail || "N/A",
            companyContactNumber: user.companyInfoData?.contactNumber || "N/A",
            activeDriversCount: driverCounts[user._id.toString()] || 0,
            status: user.Membership?.planStatus || "N/A",
            id: user._id
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "Data retrieved successfully",
            data: formattedUsers
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};


const getSingleUserDetails = async (req, res) => {
    try {
        const userId = req.body.id;

        if (!userId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required",
            });
        }

        // Fetch user details (exclude password)
        const user = await User.findById(userId).select("-contactInfoData.password");

        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        // Fetch related data
        const [
            drivers,
            results,
            invoices,
            certificates,
            documents,
            randoms
        ] = await Promise.all([
            Driver.find({ user: userId }),
            Result.find({ user: userId }),
            Invoice.find({ user: userId }),
            Certificate.find({ user: userId }),
            Document.find({ user: userId }),
            Random.find({ user: userId })
        ]);

        // Prepare drivers map for easy lookup (for results enrichment)
        const driverMap = {};
        drivers.forEach(d => { driverMap[d._id.toString()] = d });

        // Enrich results with driver data
        const enrichedResults = results.map(result => {
            const driver = driverMap[result.driverId?.toString()];
            return {
                ...result.toObject(),
                driverName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
                licenseNumber: driver ? driver.government_id : "N/A",
            };
        });

        // Convert certificateFile to base64
        const base64Certificates = certificates.map(cert => ({
            ...cert.toObject(),
            certificateFile: cert.certificateFile?.toString("base64"),
        }));

        // Convert invoice file to base64
        const base64Invoices = invoices.map(invoice => ({
            ...invoice.toObject(),
            file: invoice.file?.toString("base64"),
        }));

        // Convert documentFile to base64
        const base64Documents = documents.map(doc => ({
            ...doc.toObject(),
            documentFile: doc.documentFile?.toString("base64"),
        }));

        // Prepare response object
        const userObj = user.toObject();
        userObj.drivers = drivers;
        userObj.results = enrichedResults;
        userObj.invoices = base64Invoices;
        userObj.certificates = base64Certificates;
        userObj.documents = base64Documents;
        userObj.randoms = randoms;

        res.status(200).json({
            errorStatus: 0,
            message: "Data retrieved successfully",
            data: userObj,
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};





const updateCompanyInformation = async (req, res) => {
    try {
        const id = req.body.currentId;
        const companyInfoData = req.body.data;

        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { companyInfoData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");
        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Company information updated successfully",
            companyInfoData: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
}


const updatePaymentInformation = async (req, res) => {
    try {
        const id = req.body.currentId;
        const paymentData = req.body.data;

        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { paymentData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");
        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            message: "Payment information updated successfully",
            paymentData: updatedUser
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
}



const updateMembershipInformation = async (req, res) => {
    try {
        const id = req.body.currentId;
        let membershipData = req.body.data;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { Membership: membershipData },
            { new: true, runValidators: true }
        ).select("-contactInfoData.password");

        if (!updatedUser) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Membership information updated successfully",
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "Server error, please try again later"
        });
    }
};


module.exports = {
    getAllUserData,
    getSingleUserDetails,
    updateCompanyInformation,
    updatePaymentInformation,
    updateMembershipInformation
};
