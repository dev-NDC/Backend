const User = require("../../database/UserSchema");
const Agency = require("../../database/AgencySchema")
const isCompanyHandledByAgency = require("./checkAgencyPermission");


// Get all result
const getAllResult = async (req, res) => {
    try {
        console.log("fetching all result")
        const  agencyId  = req.user.id;

        // Step 1: Get agency and validate
        const agency = await Agency.findById(agencyId);
        if (!agency) {
            return res.status(404).json({
                errorStatus: 1,
                message: "Agency not found",
            });
        }

        // Step 2: Extract company IDs
        const handledCompanyIds = agency.handledCompanies.map(c => c._id);

        // Step 3: Get users (companies) with results that are handled by this agency
        const users = await User.find({
            _id: { $in: handledCompanyIds },
            "results.0": { $exists: true }
        }).select("companyInfoData.companyName results drivers");

        const allResults = [];

        // Step 4: Aggregate results
        for (const user of users) {
            const companyName = user.companyInfoData?.companyName || "Unknown Company";

            for (const result of user.results) {
                const driver = user.drivers.find(d => d._id.toString() === result.driverId?.toString());

                const driverName = driver ? `${driver.first_name} ${driver.last_name}` : "Unknown Driver";
                const licenseNumber = driver?.government_id || "N/A";

                allResults.push({
                    companyName,
                    driverName,
                    licenseNumber,
                    testDate: result.date,
                    testType: result.testType,
                    status: result.status,
                    caseNumber: result.caseNumber,
                    resultImage: result.file
                        ? `data:${result.mimeType};base64,${result.file.toString("base64")}`
                        : null
                });
            }
        }

        // Step 5: Sort by test date
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

// Upload Result
const uploadResult = async (req, res) => {
    try {
        const { currentId, name, licenseNumber, date, testType, status } = req.body;
        const file = req.file;
        const agencyId = req.user.id;
        if (!file) {
            return res.status(400).json({
                errorStatus: 1,
                message: "No file uploaded",
            });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(currentId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
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
        const agencyId = req.user.id;
        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(currentId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
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
        const agencyId = req.user.id;

        const user = await User.findById(currentId);
        if (!user) {
            return res.status(404).json({ errorStatus: 1, message: "User not found" });
        }

        // Check if the user belongs to handledCompanies
        const hasAccess = await isCompanyHandledByAgency(currentId, agencyId);
        if (!hasAccess) {
            return res.status(403).json({
                errorStatus: 1,
                message: "Access denied. This company does not belong to you.",
            });
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

module.exports = { getAllResult, uploadResult, editResult, deleteResult };
