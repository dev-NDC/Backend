const User = require("../../database/User");
const Agency = require("../../database/Agency");
const Driver = require("../../database/Driver");
const Result = require("../../database/Result");
const isCompanyHandledByAgency = require("./checkAgencyPermission");


// Get all result
const getAllResult = async (req, res) => {
  try {
    const agencyId = req.user.id;

    // — Validate agency
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({
        errorStatus: 1,
        message: "Agency not found",
      });
    }

    // — Build lookup maps for companies & drivers
    const handledCompanyIds = agency.handledCompanies.map(c => c._id);
    const companies = await User.find(
      { _id: { $in: handledCompanyIds } },
      "companyInfoData.companyName"
    );
    const companyNameMap = {};
    companies.forEach(c => {
      companyNameMap[c._id.toString()] =
        c.companyInfoData?.companyName || "Unknown Company";
    });

    const drivers = await Driver.find({ user: { $in: handledCompanyIds } });
    const driverMap = {};
    drivers.forEach(d => {
      driverMap[d._id.toString()] = d;
    });

    // — Fetch & transform results
    const results = await Result.find({ user: { $in: handledCompanyIds } });
    const allResults = results.map(r => {
      const drv = driverMap[r.driverId?.toString()];
      const companyName = companyNameMap[r.user.toString()] || "Unknown Company";

      // map each file → { filename, url }
      const resultImages = (r.files || []).map(f => ({
        filename: f.filename,
        url: `data:${f.mimeType};base64,${f.data.toString("base64")}`
      }));

      return {
        companyName,
        driverName: drv
          ? `${drv.first_name} ${drv.last_name}`
          : "Unknown Driver",
        licenseNumber: drv ? drv.government_id : "N/A",
        testDate: r.date,
        testType: r.testType,
        orderStatus: r.orderStatus || "N/A",
        resultStatus: r.resultStatus || "N/A",
        caseNumber: r.caseNumber,
        resultImages,          // ← now an array
      };
    });

    // — Sort newest first
    allResults.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));

    return res.status(200).json({
      errorStatus: 0,
      message: "Results fetched successfully",
      data: allResults,
    });
  } catch (error) {
    return res.status(500).json({
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
