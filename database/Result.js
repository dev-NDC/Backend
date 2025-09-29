const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  data: Buffer,
  filename: String,
  mimeType: String,
}, { _id: false });

const resultSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },

    caseNumber: String,
    date:       Date,

    // existing
    testType:   String, // previously used as "order reason" label
    orderStatus:  { type: String, default: "Pending" },
    resultStatus: { type: String, default: "Pending" },

    // attachments (array)
    files: [fileSchema],

    // legacy single-file fields (still supported)
    file: Buffer,
    filename: String,
    mimeType: String,

    // NEW: persist order metadata so reschedule can prefill with certainty
    packageName: { type: String, default: "" }, // UI label (e.g., "DOT PANEL")
    packageCode: { type: String, default: "" }, // vendor code (e.g., "DOTU")
    dotAgency:   { type: String, default: "" }, // e.g., "FMCSA"
    orderReason: { type: String, default: "" }, // explicit duplicate of testType
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
