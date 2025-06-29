const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema({
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
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  }
}, { timestamps: true });

module.exports = mongoose.model("Visitor", visitorSchema);
