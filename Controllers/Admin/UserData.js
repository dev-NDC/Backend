const User = require("../../database/schema"); // Import User model

const getAllUserData = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.find({}, "_id companyInfoData.contactNumber companyInfoData.companyEmail companyInfoData.companyName drivers");
        // Transform the data
        const formattedUsers = users.map(user => ({
            companyName: user.companyInfoData?.companyName || "N/A",
            companyEmail: user.companyInfoData?.companyEmail || "N/A",
            companyContactNumber: user.companyInfoData?.contactNumber || "N/A",
            activeDriversCount: user.drivers ? user.drivers.filter(driver => !driver.isDeleted).length : 0,
            status: "active",
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
        const userId = req.body.id; // Extract user ID from request body

        if (!userId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "User ID is required",
            });
        }

        // Fetch user details from the database
        const user = await User.findById(userId).select("-contactInfoData.password");;

        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found",
            });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Data retrieved successfully",
            data: user, // Send the whole user object
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
        console.log(req.body)
        const id = req.body.currentId;
        const companyInfoData  = req.body.data;

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
            companyInfoData: updatedUser.companyInfoData
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
        const paymentData  = req.body.data;

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

module.exports = { getAllUserData,getSingleUserDetails,updateCompanyInformation,updatePaymentInformation };
