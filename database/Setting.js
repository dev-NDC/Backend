const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema({
  // Admin toggles
  sendWelcomeEmail: { type: Boolean, default: true },

  // PDF sending toggles
  sendCustomerPDF: { type: Boolean, default: true },
  sendAgreementPDF: { type: Boolean, default: true },
  sendCertificatePDF: { type: Boolean, default: true },
  sendWelcomePDF: { type: Boolean, default: true },

  // Optional: meta identifiers
  orgIdAndLocationCode: { type: Boolean, default: true },
  
}, { timestamps: true });

module.exports = mongoose.model("Setting", settingSchema);
