const Setting = require("../../database/Setting");

const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    if (!settings) {
      // If no settings exist, create default
      settings = await Setting.create({});
    }
    res.status(200).json({
      errorStatus: 0,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

const updateSendWelcomeEmail = async (req, res) => {
  try {
    const { value } = req.body;

    const settings = await Setting.findOneAndUpdate(
      {},
      { sendWelcomeEmail: value },
      { new: true }
    );

    if (!settings) {
      return res.status(404).json({ errorStatus: 1, message: "Settings not found" });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "sendWelcomeEmail updated successfully",
      data: settings.sendWelcomeEmail,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to update sendWelcomeEmail",
      error: error.message,
    });
  }
};


const updateSendCustomerPDF = async (req, res) => {
  try {
    const { value } = req.body;

    const settings = await Setting.findOneAndUpdate(
      {},
      { sendCustomerPDF: value },
      { new: true }
    );

    if (!settings) {
      return res.status(404).json({ errorStatus: 1, message: "Settings not found" });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "sendCustomerPDF updated successfully",
      data: settings.sendCustomerPDF,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to update sendCustomerPDF",
      error: error.message,
    });
  }
};


const updateSendAgreementPDF = async (req, res) => {
  try {
    const { value } = req.body;

    const settings = await Setting.findOneAndUpdate(
      {},
      { sendAgreementPDF: value },
      { new: true }
    );

    if (!settings) {
      return res.status(404).json({ errorStatus: 1, message: "Settings not found" });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "sendAgreementPDF updated successfully",
      data: settings.sendAgreementPDF,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to update sendAgreementPDF",
      error: error.message,
    });
  }
};


const updateSendCertificatePDF = async (req, res) => {
  try {
    const { value } = req.body;

    const settings = await Setting.findOneAndUpdate(
      {},
      { sendCertificatePDF: value },
      { new: true }
    );

    if (!settings) {
      return res.status(404).json({ errorStatus: 1, message: "Settings not found" });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "sendCertificatePDF updated successfully",
      data: settings.sendCertificatePDF,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to update sendCertificatePDF",
      error: error.message,
    });
  }
};



const updateOrgIdAndLocationCode = async (req, res) => {
  try {
    const { value } = req.body;

    const settings = await Setting.findOneAndUpdate(
      {},
      { orgIdAndLocationCode: value },
      { new: true }
    );

    if (!settings) {
      return res.status(404).json({ errorStatus: 1, message: "Settings not found" });
    }

    res.status(200).json({
      errorStatus: 0,
      message: "orgIdAndLocationCode updated successfully",
      data: settings.orgIdAndLocationCode,
    });
  } catch (error) {
    res.status(500).json({
      errorStatus: 1,
      message: "Failed to update orgIdAndLocationCode",
      error: error.message,
    });
  }
};


module.exports = {
  updateSendWelcomeEmail,
  updateSendCustomerPDF,
  updateSendAgreementPDF,
  updateSendCertificatePDF,
  updateOrgIdAndLocationCode,
  getSettings,
};