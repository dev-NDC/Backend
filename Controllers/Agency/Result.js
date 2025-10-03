// Controllers/Agency/Result.js
const Result = require("../../database/Result");
const Driver = require("../../database/Driver");
const User = require("../../database/User");
const Agency = require("../../database/Agency");

/** Same response shape as Admin, but filtered to agency's handled companies */
const getAllResult = async (req, res) => {
  try {
    const agencyId = req.user?.id;
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ errorStatus: 1, message: "Agency not found" });
    }
    const handledCompanyIds = (agency.handledCompanies || []).map((c) => c._id);

    const results = await Result.find({ user: { $in: handledCompanyIds } })
      .populate("user", "companyInfoData.companyName _id")
      .populate("driverId", "first_name last_name government_id");

    const allResults = results.map((result) => {
      const resultImages = (result.files || []).map((file) => ({
        filename: file.filename,
        url: `data:${file.mimeType};base64,${file.data.toString("base64")}`,
      }));

      return {
        _id: result._id,
        userId: result.user?._id,
        companyName: result.user?.companyInfoData?.companyName || "Unknown Company",
        driverName: result.driverId
          ? `${result.driverId.first_name} ${result.driverId.last_name}`
          : "Unknown Driver",
        licenseNumber: result.driverId?.government_id || "N/A",
        testDate: result.date,
        testType: result.testType,
        orderStatus: result.orderStatus || "N/A",
        resultStatus: result.resultStatus || "N/A",
        caseNumber: result.caseNumber,
        resultImages,

        // persisted metadata
        packageName: result.packageName || "",
        packageCode: result.packageCode || "",
        dotAgency: result.dotAgency || "",
        orderReason: result.orderReason || result.testType || "",

        // ORDER INFO (flat)
        selectedPackageId: result.selectedPackageId || "",
        selectedOrderReasonId: result.selectedOrderReasonId || "",
        orderExpires: result.orderExpires || "",
        sendLink: !!result.sendLink,
        donorPass: !!result.donorPass,
        referenceNumber: result.referenceNumber || "",
        schedulingUrl: result.schedulingUrl || "",

        // PARTICIPANT INFO (flat)
        firstName: result.firstName || "",
        middleName: result.middleName || "",
        lastName: result.lastName || "",
        ssnEid: result.ssnEid || "",
        dobString: result.dobString || "",
        phone1: result.phone1 || "",
        phone2: result.phone2 || "",
        email: result.email || "",
        ccEmail: result.ccEmail || "",
        observedBool: !!result.observedBool,
        address: result.address || "",
        address2: result.address2 || "",
        city: result.city || "",
        state: result.state || "",
        zip: result.zip || "",
      };
    });

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
    const {
      currentId,
      driverId,
      caseNumber,
      date,
      testType,
      status,

      // optional
      packageName,
      packageCode,
      dotAgency,
      orderReason,
    } = req.body;

    const file = req.file;

    // verify company belongs to agency
    const agency = await Agency.findById(req.user?.id);
    if (!agency) {
      return res.status(403).json({ errorStatus: 1, message: "Unauthorized" });
    }
    const handledIds = new Set((agency.handledCompanies || []).map((c) => String(c._id)));
    if (!handledIds.has(String(currentId))) {
      return res.status(403).json({
        errorStatus: 1,
        message: "Access denied. This company is not handled by your agency.",
      });
    }

    const user = await User.findById(currentId);
    if (!user) {
      return res.status(404).json({ errorStatus: 1, message: "User not found" });
    }
    const driver = await Driver.findOne({ _id: driverId, user: currentId });
    if (!driver) {
      return res.status(404).json({ errorStatus: 1, message: "Driver not found" });
    }

    const result = new Result({
      user: currentId,
      driverId,
      date: new Date(date),
      testType,
      status,
      caseNumber,

      packageName: packageName || "",
      packageCode: packageCode || "",
      dotAgency: dotAgency || "",
      orderReason: orderReason || testType || "",

      file: file?.buffer,
      filename: file?.originalname,
      mimeType: file?.mimetype,
    });

    await result.save();

    driver.isActive = status === "Negative";
    await driver.save();

    res.status(200).json({
      errorStatus: 0,
      message: "Result uploaded successfully",
    });
  } catch (error) {
    console.error("Agency uploadResult error:", error);
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
    const parsedUpdatedData =
      typeof updatedData === "string" ? JSON.parse(updatedData) : updatedData;
    const file = req.file;

    // agency access check
    const agency = await Agency.findById(req.user?.id);
    const handledIds = new Set((agency?.handledCompanies || []).map((c) => String(c._id)));
    if (!agency || !handledIds.has(String(currentId))) {
      return res.status(403).json({
        errorStatus: 1,
        message: "Access denied. This company is not handled by your agency.",
      });
    }

    const result = await Result.findOne({ _id: resultId, user: currentId });
    if (!result) {
      return res.status(404).json({ errorStatus: 1, message: "Result not found" });
    }

    result.status = parsedUpdatedData?.status ?? result.status;
    result.testType = parsedUpdatedData?.testType ?? result.testType;
    result.caseNumber = parsedUpdatedData?.caseNumber ?? result.caseNumber;
    result.date = parsedUpdatedData?.date ? new Date(parsedUpdatedData.date) : result.date;

    if (parsedUpdatedData?.packageName !== undefined)
      result.packageName = parsedUpdatedData.packageName;
    if (parsedUpdatedData?.packageCode !== undefined)
      result.packageCode = parsedUpdatedData.packageCode;
    if (parsedUpdatedData?.dotAgency !== undefined)
      result.dotAgency = parsedUpdatedData.dotAgency;
    if (parsedUpdatedData?.orderReason !== undefined)
      result.orderReason = parsedUpdatedData.orderReason;

    if (file) {
      result.file = file.buffer;
      result.filename = file.originalname;
      result.mimeType = file.mimetype;
    }

    await result.save();

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

    // agency access check
    const agency = await Agency.findById(req.user?.id);
    const handledIds = new Set((agency?.handledCompanies || []).map((c) => String(c._id)));
    if (!agency || !handledIds.has(String(currentId))) {
      return res.status(403).json({
        errorStatus: 1,
        message: "Access denied. This company is not handled by your agency.",
      });
    }

    const result = await Result.findOneAndDelete({ _id: resultId, user: currentId });
    if (!result) {
      return res
        .status(404)
        .json({ errorStatus: 1, message: "Result not found" });
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
