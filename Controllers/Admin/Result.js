const User = require("../../database/schema");

// Upload Result
const uploadResult = async (req, res) => {
    try {
        const { currentId, name, licenseNumber, date, testType, status } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }

        const result = {
            name,
            licenseNumber,
            date: new Date(date),
            testType,
            status,
            file: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        };

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        user.results.push(result);
        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Result uploaded successfully",
        });
    } catch (error) {
        console.error("Upload Result error:", error);
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

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        const result = user.results.id(resultId);
        if (!result) {
            return res.status(404).json({ errorStatus: 1, message: "Result not found" });
        }

        result.name = updatedData.name || result.name;
        result.licenseNumber = updatedData.licenseNumber || result.licenseNumber;
        result.date = new Date(updatedData.date) || result.date;
        result.testType = updatedData.testType || result.testType;
        result.status = updatedData.status || result.status;

        await user.save();

        res.status(200).json({
            errorStatus: 0,
            message: "Result updated successfully",
        });
    } catch (error) {
        console.error("Edit Result error:", error);
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
        console.error("Delete Result error:", error);
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while deleting result",
            error: error.message,
        });
    }
};

module.exports = { uploadResult, editResult, deleteResult };
