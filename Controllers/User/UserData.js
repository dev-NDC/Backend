const User = require("../../database/schema")

const userData = async (req, res) => {
    try {
        const id = req.user.userId;
        const data = await User.findById(id).select("-contactInfoData.password -_id");
        res.status(200).json({
            errorStatus: 0,
            message: "Everything is fine",
            data
        })
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
}

const updateCompanyInformation = async (req, res) => {
    try {
        const id = req.user.userId;
        const { ...companyInfoData } = req.body;
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

const updatePayment = async (req, res) => {
    try {
        const id = req.user.userId;
        const { ...paymentData } = req.body;
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
            message: "Payment Information updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            error,
            message: "server error, please try again later"
        })
    }
}

module.exports = { userData, updateCompanyInformation, updatePayment };