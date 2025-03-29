const User = require("../../database/schema")

const AddDriver = async (req, res) => {
    try {
        const {name, email, license, dob, phone } = req.body;
        const userId = req.user.userId;

        // Find user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                errorStatus:1,
                message: "User not found" 
            });
        }

        // Create new driver object
        const newDriver = {
            name,
            email,
            licenseNumber : license,
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
            errorStatus:0,
            message: "Driver added successfully", 
            user: user 
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: 'server error, please try again later'
        })
    }
}

module.exports = { AddDriver }