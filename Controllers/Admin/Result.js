const User = require("../../database/schema");

// Upload Result
const uploadResult = async (req, res) => {
    try {
        const { currentId, driverId, caseNumber, date, testType, status } = req.body;
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }
        const result = {
            driverId : driverId,
            date: new Date(date),
            testType,
            status,
            caseNumber,
            file: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        };

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }
        user.results.push(result);
        const driver = user.drivers.id(result.driverId);
        if (driver) {
            driver.isActive = result.status === "Negative";
        }
        await user.save();
        res.status(200).json({
            errorStatus: 0,
            message: "Result uploaded successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while uploading result",
            error: error.message,
        });
    }
};

// Edit Result
const editResult = async (req, res) => {
    try {
        const { currentId, resultId, updatedData } = req.body;
        const parsedUpdatedData = JSON.parse(updatedData);
        const file = req.file;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const result = user.results.id(resultId);
        if (!result) {
            return res.status(404).json({ errorStatus: 1, message: "Result not found" });
        }

        // Update result fields
        result.status = parsedUpdatedData?.status || result.status;

        // Update file if a new one is uploaded
        if (file) {
            result.file = file.buffer;
            result.filename = file.originalname;
            result.mimeType = file.mimetype;
        }

        // Update driver's isActive status based on result status
        const driver = user.drivers.id(result.driverId);
        if (driver) {
            driver.isActive = result.status === "Negative";
        }

        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Result updated successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while editing result",
            error: error.message,
        });
    }
};




// Delete Result
const deleteResult = async (req, res) => {
    try {
        const { currentId, resultId } = req.body;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const resultIndex = user.results.findIndex(res => res._id.toString() === resultId);
        if (resultIndex === -1) {
            return res.status(404).json({ errorStatus: 1, message: "Result not found" });
        }

        user.results.splice(resultIndex, 1);
        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Result deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while deleting result",
            error: error.message,
        });
    }
};

module.exports = { uploadResult, editResult, deleteResult };
