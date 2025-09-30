// controllers/results.js
const Result = require("../../database/Result");
const Driver = require("../../database/Driver");
const User = require("../../database/User");

const getAllResult = async (req, res) => {
  try {
    const results = await Result.find({})
      .populate("user", "companyInfoData.companyName _id")
      .populate("driverId", "first_name last_name government_id dob email phone address municipality region postal_code");

    const allResults = results.map((result) => {
      const resultImages = (result.files || []).map((file) => ({
        filename: file.filename,
        url: `data:${file.mimeType};base64,${file.data.toString("base64")}`,
      }));

      return {
        _id: result._id,
        userId: result.user?._id,
        companyName: result.user?.companyInfoData?.companyName || result.companySnapshot?.companyName || "Unknown Company",

        // Driver
        driverName: result.driverId ? `${result.driverId.first_name} ${result.driverId.last_name}` : "Unknown Driver",
        licenseNumber: result.driverId?.government_id || result.participant?.governmentId || "N/A",

        // Dates & status
        testDate: result.date,
        testType: result.testType || result.orderReason || "",
        orderStatus: result.orderStatus || "N/A",
        resultStatus: result.resultStatus || "N/A",
        status: result.status || "Pending",

        // Case
        caseNumber: result.caseNumber,
        schedulingUrl: result.schedulingUrl || "",

        // Images
        resultImages,

        // Rich order metadata
        packageId: result.packageId || "",
        packageName: result.packageName || "",
        packageCode: result.packageCode || "",
        orderReasonId: result.orderReasonId || "",
        orderReason: result.orderReason || "",
        dotAgency: result.dotAgency || "",

        sendLink: result.sendLink || false,
        donorPass: result.donorPass || false,
        observed: !!result.observed,

        expirationDateTime: result.expirationDateTime || "",
        orderReferenceNumber: result.orderReferenceNumber || "",

        toEmail: result.toEmail || "",
        ccEmail: result.ccEmail || "",
        allEmails: result.allEmails || "",

        participant: result.participant || null,
        address: result.address || null,

        selectedSite: result.selectedSite || null,
        lastSearchZip: result.lastSearchZip || "",
      };
    });

    allResults.sort((a, b) => new Date(b.testDate) - new Date(a.testDate));

    res.status(200).json({
      errorStatus: 0,
      message: "Results fetched successfully",
      data: allResults,
    });
  } catch (error) {
    console.error("getAllResult error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while fetching results",
      error: error.message,
    });
  }
};

// Optional admin upload keeps working; allow writing extended fields too.
const uploadResult = async (req, res) => {
  try {
    const {
      currentId,
      driverId,
      caseNumber,
      date,
      testType,
      status,

      // optional extended fields
      packageId,
      packageName,
      packageCode,
      dotAgency,
      orderReason,
    } = req.body;

    const file = req.file;

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

      packageId: packageId || "",
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

    res.status(200).json({ errorStatus: 0, message: "Result uploaded successfully" });
  } catch (error) {
    console.error("Error uploading result:", error);
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

    const result = await Result.findOne({ _id: resultId, user: currentId });
    if (!result) {
      return res.status(404).json({ errorStatus: 1, message: "Result not found" });
    }

    // Common fields
    if (parsedUpdatedData?.status !== undefined) result.status = parsedUpdatedData.status;
    if (parsedUpdatedData?.testType !== undefined) result.testType = parsedUpdatedData.testType;
    if (parsedUpdatedData?.caseNumber !== undefined) result.caseNumber = parsedUpdatedData.caseNumber;
    if (parsedUpdatedData?.date) result.date = new Date(parsedUpdatedData.date);

    // Extended order metadata
    [
      "packageId","packageName","packageCode","dotAgency","orderReason",
      "sendLink","donorPass","observed","expirationDateTime","orderReferenceNumber",
      "toEmail","ccEmail","allEmails","lastSearchZip",
      "schedulingUrl","orderStatus","resultStatus"
    ].forEach((k) => {
      if (parsedUpdatedData?.[k] !== undefined) result[k] = parsedUpdatedData[k];
    });

    // Nested objects
    if (parsedUpdatedData?.participant) {
      result.participant = { ...(result.participant || {}), ...parsedUpdatedData.participant };
    }
    if (parsedUpdatedData?.address) {
      result.address = { ...(result.address || {}), ...parsedUpdatedData.address };
    }
    if (parsedUpdatedData?.selectedSite) {
      result.selectedSite = { ...(result.selectedSite || {}), ...parsedUpdatedData.selectedSite };
    }

    if (file) {
      result.file = file.buffer;
      result.filename = file.originalname;
      result.mimeType = file.mimetype;
    }

    await result.save();

    // keep driver active flag in sync if provided
    if (result.driverId) {
      const driver = await Driver.findOne({ _id: result.driverId, user: currentId });
      if (driver) {
        if (parsedUpdatedData?.status) driver.isActive = parsedUpdatedData.status === "Negative";
        await driver.save();
      }
    }

    res.status(200).json({ errorStatus: 0, message: "Result updated successfully" });
  } catch (error) {
    console.error("editResult error:", error);
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
    const result = await Result.findOneAndDelete({ _id: resultId, user: currentId });
    if (!result) {
      return res.status(404).json({ errorStatus: 1, message: "Result not found" });
    }
    res.status(200).json({ errorStatus: 0, message: "Result deleted successfully" });
  } catch (error) {
    console.error("deleteResult error:", error);
    res.status(500).json({
      errorStatus: 1,
      message: "Server error while deleting result",
      error: error.message,
    });
  }
};

module.exports = { uploadResult, editResult, deleteResult, getAllResult };
