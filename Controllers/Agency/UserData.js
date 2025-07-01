const User = require("../../database/UserSchema");
const Agency = require("../../database/AgencySchema");
const isCompanyHandledByAgency = require("./checkAgencyPermission");

const getAllUserData = async (req, res) => {
    try {
        const agencyId = req.user.id;
        // Fetch agency
        const currentAgency = await Agency.findById(agencyId);
        if (!currentAgency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }

        const handledCompanyIds = currentAgency.handledCompanies || [];
        if (handledCompanyIds.length === 0) {
            return res.status(200).json({
                errorStatus: 0,
                message: "No companies handled yet",
                data: [],
            });
        }

        const users = await User.find(
            { _id: { $in: handledCompanyIds } },
            "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName drivers Membership"
        );

        const formattedUsers = users.map(user => ({
            companyName: user.companyInfoData?.companyName || "N/A",
            companyEmail: user.companyInfoData?.companyEmail || "N/A",
            companyContactNumber: user.companyInfoData?.contactNumber || "N/A",
            activeDriversCount: user.drivers?.filter(d => !d.isDeleted && d.isActive)?.length || 0,
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
        const agencyId = req.user.id;

        if (!userId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required",
            });
        }

        // Fetch current agency
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Unauthorized access – agency not found",
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(userId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }

        // Fetch user details
        const user = await User.findById(userId).select("-contactInfoData.password");
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        const userObj = user.toObject();

        // Enrich results with driver info
        userObj.results = userObj.results.map(result => {
            const driver = userObj.drivers.find(d => d._id.toString() === result.driverId?.toString());
            return {
                ...result,
                driverName: driver ? `${driver.first_name} ${driver.last_name}` : "Unknown",
                licenseNumber: driver ? driver.government_id : "N/A",
            };
        });
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
        const agencyId = req.user.id;
        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(id, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }


        const updatedUser = await User.findByIdAndUpdate(
            id,
            { companyInfoData },
            { new: true, runValidators: true } // Return updated user & validate input
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
            companyInfoData: updatedUser.companyInfoData
        });
    } catch (error) {
        console.error("Error updating company information:", error);
        // Log the error for debugging purposes
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
        const agencyId = req.user.id;
        const paymentData = req.body.data;

        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(id, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }


        const updatedUser = await User.findByIdAndUpdate(
            id,
            { paymentData },
            { new: true, runValidators: true } // Return updated user & validate input
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
            paymentData: updatedUser.paymentData
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
}

module.exports = { getAllUserData, getSingleUserDetails, updateCompanyInformation, updatePaymentInformation };
