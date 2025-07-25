const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
  caseNumber: String,
  date: Date,
  testType: String,
  orderStatus: String,
  resultStatus: String,
  files: [
    {
      data: Buffer,
      filename: String,
      mimeType: String,
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Result", resultSchema);
