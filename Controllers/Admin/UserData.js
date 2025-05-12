const User = require("../../database/schema"); // Import User model

const getAllUserData = async (req, res) => {
    try {
        // Fetch users with only the "user" role
        const users = await User.find(
            { role: ["User"] },  // Ensures the role array has exactly one element and that is "user"
            "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName drivers Membership"
        );
        // Transform the data
        const formattedUsers = users.map(user => ({
            companyName: user.companyInfoData?.companyName || "N/A",
            companyEmail: user.companyInfoData?.companyEmail || "N/A",
            companyContactNumber: user.companyInfoData?.contactNumber || "N/A",
            activeDriversCount: user.drivers ? user.drivers.filter(driver => !driver.isDeleted).length : 0,
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

        // Fetch user details
        const user = await User.findById(userId).select("-contactInfoData.password");

        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        // Clone the user object to avoid modifying the Mongoose document
        const userObj = user.toObject();

        // Enrich each result with driver name and government_id
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

        if (!id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required"
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
        const membershipData = req.body.data;

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
            Membership: updatedUser
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "Server error, please try again later"
        });
    }
};

module.exports = { getAllUserData, getSingleUserDetails, updateCompanyInformation, updatePaymentInformation, updateMembershipInformation};
