const User = require("../../database/schema")

const AddDriver = async (req, res) => {
    try {
        const { name, email, license, dob, phone } = req.body;
        const userId = req.user.userId;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User not found"
            });
        }

        // Create new driver object
        const newDriver = {
            name,
            email,
            licenseNumber: license,
            dob,
            phone,
            creationDate: new Date().toISOString(), // Current date
            createdBy: "Customer", // Set createdBy to Customer
            deletionDate: null, // Leave empty
            isDeleted: false
        };

        // Push driver to user's `drivers` array
        user.drivers.push(newDriver);

        // Save updated user document
        await user.save();
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
        const userId = req.user.userId;
        const { _id, ...updatedDriverData } = req.body;

        // Find and update the driver in the user's `drivers` array
        const user = await User.findOneAndUpdate(
            { _id: userId, "drivers._id": _id },
            { $set: { "drivers.$": updatedDriverData } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                errorStatus: 1,
                message: "User or driver not found",
            });
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Driver updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later"
        });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const driverId = req.body._id;
        const userId = req.user.userId;
        const updatedUser = await User.findOneAndUpdate(
            { _id: userId, "drivers._id": driverId },
            { 
                $set: { 
                    "drivers.$.isDeleted": true, 
                    "drivers.$.deletionDate": new Date().toISOString() 
                } 
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
        res.status(500).json({
            errorStatus: 1,
            message: "Server error, please try again later"
        });
    }
}

module.exports = { AddDriver, updateDriver, deleteDriver }