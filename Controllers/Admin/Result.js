const Result = require("../../database/Result");
const Driver = require("../../database/Driver");
const User = require("../../database/User");

const getAllResult = async (req, res) => {
    try {
        // Fetch all results and populate driver & user (company) fields
        const results = await Result.find({})
            .populate('user', 'companyInfoData.companyName')
            .populate('driverId', 'first_name last_name government_id');

        const allResults = results.map(result => ({
            companyName: result.user?.companyInfoData?.companyName || "Unknown Company",
            driverName: result.driverId
                ? `${result.driverId.first_name} ${result.driverId.last_name}`
                : "Unknown Driver",
            licenseNumber: result.driverId?.government_id || "N/A",
            testDate: result.date,
            testType: result.testType,
            status: result.status,
            caseNumber: result.caseNumber,
            resultImage: result.file
                ? `data:${result.mimeType};base64,${result.file.toString("base64")}`
                : null
        }));

        // Sort by test date, newest first
        allResults.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));

        res.status(200).json({
            errorStatus: 0,
            message: "Results fetched successfully",
            data: allResults,
        });

    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while fetching results",
            error: error.message,
        });
    }
};


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

        // Confirm user and driver exist
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }
        const driver = await Driver.findOne({ _id: driverId, user: currentId });
        if (!driver) {
            return res.status(404).json({ errorStatus: 1, message: "Driver not found" });
        }

        // Create and save result document
        const result = new Result({
            user: currentId,
            driverId,
            date: new Date(date),
            testType,
            status,
            caseNumber,
            file: file.buffer,
            filename: file.originalname,
            mimeType: file.mimetype,
        });

        await result.save();

        // Update driver's isActive status based on result status
        driver.isActive = status === "Negative";
        await driver.save();

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


const editResult = async (req, res) => {
    try {
        const { currentId, resultId, updatedData } = req.body;
        const parsedUpdatedData = typeof updatedData === "string" ? JSON.parse(updatedData) : updatedData;
        const file = req.file;

        // Find result
        const result = await Result.findOne({ _id: resultId, user: currentId });
        if (!result) {
            return res.status(404).json({ errorStatus: 1, message: "Result not found" });
        }

        // Update result fields
        result.status = parsedUpdatedData?.status || result.status;
        result.testType = parsedUpdatedData?.testType || result.testType;
        result.caseNumber = parsedUpdatedData?.caseNumber || result.caseNumber;
        result.date = parsedUpdatedData?.date ? new Date(parsedUpdatedData.date) : result.date;

        // Update file if a new one is uploaded
        if (file) {
            result.file = file.buffer;
            result.filename = file.originalname;
            result.mimeType = file.mimetype;
        }

        await result.save();

        // Also update driver's isActive status if driver exists
        const driver = await Driver.findOne({ _id: result.driverId, user: currentId });
        if (driver) {
            driver.isActive = result.status === "Negative";
            await driver.save();
        }

        res.status(200).json({
            errorStatus: 0,
            message: "Result updated successfully",
        });
    } catch (error) {
        res.status(500).json({
            errorStatus: 1,
            message: "Server error while editing result",
            error: error.message,
        });
    }
};


const deleteResult = async (req, res) => {
    try {
        const { currentId, resultId } = req.body;

        // Delete result document
        const result = await Result.findOneAndDelete({ _id: resultId, user: currentId });

        if (!result) {
            return res.status(404).json({ errorStatus: 1, message: "Result not found" });
        }

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

module.exports = { uploadResult, editResult, deleteResult, getAllResult };
