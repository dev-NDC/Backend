const mongoose = require("mongoose");

const visitorSettingSchema = new mongoose.Schema({
  // General Visitor Info (customize as needed)
  ipAddress: String,
  userAgent: String,
  location: {
    country: String,
    city: String,
    region: String,
    timezone: String,
  },
  visitTime: {
    type: Date,
    default: Date.now,
  },

  // Optional: associate with user ID if logged in
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Backend toggles for feature control
  backendSettings: {
    enableFeatureA: { type: Boolean, default: false },
    enableFeatureB: { type: Boolean, default: false },
    enableLogging: { type: Boolean, default: true },
    maintenanceMode: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model("VisitorSetting", visitorSettingSchema);
