// models/websiteVisitModel.js
const mongoose = require("mongoose");

const websiteVisitSchema = new mongoose.Schema({
  ipAddress: String, // optional: log user IP
  page: String,      // e.g., "/home", "/dashboard"
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("WebsiteVisit", websiteVisitSchema);
