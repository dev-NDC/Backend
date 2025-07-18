const User = require("../../database/User");
const Driver = require("../../database/Driver");
const isCompanyHandledByAgency = require("./checkAgencyPermission");


const AddDriver = async (req, res) => {
    try {
        const { firstName, lastName, email, license, dob, phone } = req.body.driver;
        const userId = req.body.currentId;
        const agencyId = req.user.id;

        if (!userId || userId == null || !firstName || !lastName || !email || !license || !dob || !phone) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Please provide all required fields"
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


        // Find user by ID
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
            message: 'server error, please try again later'
        })
    }
}

const updateDriver = async (req, res) => {
    try {
        const userId = req.body.currentId;
        const driverData = req.body.driver;
        const agencyId = req.user.id;

        if (!driverData || !driverData._id) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Invalid driver data. '_id' is required.",
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
    console.log("Delete Driver API called");
    try {
        const driverId = req.body.driver._id;  // Change this to match your body structure
        const userId = req.body.currentId;   // Ensure the current user ID is coming from req.user (authentication)

        const agencyId = req.user.id; // Get the agency ID from the authenticated user
        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(userId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
        }
        if (!driverId) {
            return res.status(400).json({
                errorStatus: 1,
                message: "Driver ID is required",
            });
        }
        const updatedUser = await Driver.findOneAndUpdate(
            { _id: driverId, user: userId, isDeleted: false },
            {
                $set: {
                    isDeleted: true,
                    deletionDate: new Date().toISOString(),
                    deletedBy: "Agency",
                },
            },
            { new: true }
        );

        if (!updatedUser) {
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
        console.error("Error deleting driver:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later",
            error: error.message,
        });
    }
};


module.exports = { AddDriver, updateDriver, deleteDriver }