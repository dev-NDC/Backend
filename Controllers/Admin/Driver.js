const Driver = require("../../database/Driver");
const User = require("../../database/User");
const Result = require("../../database/Result");


const allCompany = async (req, res) => {
    try {
        // Only fetch companies (users) with a companyName
        const companies = await User.find(
            { "companyInfoData.companyName": { $exists: true, $ne: "" } },
            { "companyInfoData.companyName": 1 }
        ).lean();

        // Format output
        const formatted = companies.map(company => ({
            _id: company._id,
            companyName: company.companyInfoData?.companyName || "N/A",
        }));

        res.status(200).json({
            errorStatus: 0,
            message: "All companies fetched successfully",
            data: formatted,
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, could not fetch companies",
            error: error.message,
        });
    }
};


const ChangeDriverCompany = async (req, res) => {
    try {
        const { driverId, newCompanyId } = req.body;

        // 1. Find and update the driver
        const driver = await Driver.findById(driverId);
        if (!driver) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Driver not found"
            });
        }

        const oldCompanyId = driver.user.toString();
        driver.user = newCompanyId;
        await driver.save();

        // 2. Update all results where user === oldCompanyId and driverId === driverId
        await Result.updateMany(
            { driverId: driverId, user: oldCompanyId },
            { $set: { user: newCompanyId } }
        );

        res.status(200).json({
            errorStatus: 0,
            message: "Driver company changed successfully and related results updated."
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later.",
            error: error.message
        });
    }
};


const AddDriver = async (req, res) => {
    try {
        const { firstName, lastName, email, license, dob, phone } = req.body.driver;
        const userId = req.body.currentId;
        if (!userId || !firstName || !lastName || !email || !license || !dob || !phone) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Please provide all required fields"
            });
        }
        // Confirm user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }

        // Create and save driver document
        const newDriver = new Driver({
            user: userId,
            first_name: firstName,
            last_name: lastName,
            email,
            government_id: license,
            dob,
            phone,
            creationDate: new Date().toISOString(),
            isActive: true,
            createdBy: "Admin",
            deletionDate: null,
            isDeleted: false
        });

        await newDriver.save();

        res.status(201).json({
            errorStatus: 0,
            message: "Driver added successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: 'Server error, please try again later'
        });
    }
};

const updateDriver = async (req, res) => {
    try {
        const userId = req.body.currentId;
        const driverData = req.body.driver;

        if (!driverData || !driverData._id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Invalid driver data. '_id' is required.",
            });
        }

        // Find and update driver (must match user for security)
        const updatedDriver = await Driver.findOneAndUpdate(
            { _id: driverData._id, user: userId, isDeleted: false },
            { $set: { ...driverData, updatedAt: new Date() } },
            { new: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Driver not found",
            });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Driver updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message
        });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const driverId = req.body.driver._id;
        const userId = req.body.currentId;

        if (!driverId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Driver ID is required",
            });
        }

        // Soft delete driver (set isDeleted, deletionDate, deletedBy)
        const updatedDriver = await Driver.findOneAndUpdate(
            { _id: driverId, user: userId, isDeleted: false },
            {
                $set: {
                    isDeleted: true,
                    deletionDate: new Date().toISOString(),
                    deletedBy: "Admin",
                },
            },
            { new: true }
        );

        if (!updatedDriver) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Driver not found",
            });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Driver deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};


module.exports = { AddDriver, updateDriver, deleteDriver, allCompany, ChangeDriverCompany };
