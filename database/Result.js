// database/Result.js
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    data: Buffer,
    filename: String,
    mimeType: String,
  },
  { _id: false }
);

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

    // existing persisted order metadata
    packageName: { type: String, default: "" }, // UI label (e.g., "DOT PANEL")
    packageCode: { type: String, default: "" }, // vendor code (e.g., "DOTU")
    dotAgency:   { type: String, default: "" }, // e.g., "FMCSA"
    orderReason: { type: String, default: "" }, // explicit duplicate of testType

    // --- NEW: ORDER INFORMATION (flat) ---
    selectedPackageId:     { type: String, default: "" },
    selectedOrderReasonId: { type: String, default: "" },
    orderExpires:          { type: String, default: "" }, // original datetime-local string
    sendLink:              { type: Boolean, default: false },
    donorPass:             { type: Boolean, default: false },
    referenceNumber:       { type: String, default: "" },
    schedulingUrl:         { type: String, default: "" },

    // --- NEW: PARTICIPANT INFORMATION (flat) ---
    firstName:   { type: String, default: "" },
    middleName:  { type: String, default: "" },
    lastName:    { type: String, default: "" },
    ssnEid:      { type: String, default: "" },
    dobString:   { type: String, default: "" }, // stored as string to mirror form input
    phone1:      { type: String, default: "" },
    phone2:      { type: String, default: "" },
    email:       { type: String, default: "" },
    ccEmail:     { type: String, default: "" },
    observedBool:{ type: Boolean, default: false },
    address:     { type: String, default: "" },
    address2:    { type: String, default: "" },
    city:        { type: String, default: "" },
    state:       { type: String, default: "" },
    zip:         { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
