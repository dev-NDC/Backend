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

const participantSchema = new mongoose.Schema(
  {
    firstName: String,
    middleName: String,
    lastName: String,
    governmentId: String,
    ssnState: String,
    dob: String,
    phone1: String,
    phone2: String,
    email: String,
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    zip: String,
  },
  { _id: false }
);

const companySnapshotSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    companyName: String,
    orgId: String,
    locationCode: String,
  },
  { _id: false }
);

const siteSchema = new mongoose.Schema(
  {
    collection_site_link_id: String,
    name: String,
    address: String,
    city: String,
    state: String,
    zip: String,
    phone: String,
    distance: String,
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },

    // Core case
    caseNumber: String,
    date: Date,

    // Legacy/compat
    testType: String,
    orderStatus: { type: String, default: "Pending" },
    resultStatus: { type: String, default: "Pending" },
    status: { type: String, default: "Pending" },

    // Attachments (multi & legacy single)
    files: [fileSchema],
    file: Buffer,
    filename: String,
    mimeType: String,

    // Company snapshot
    companySnapshot: companySnapshotSchema,

    // Order selections / metadata
    packageId: { type: String, default: "" },
    packageName: { type: String, default: "" },
    packageCode: { type: String, default: "" },
    orderReasonId: { type: String, default: "" },
    orderReason: { type: String, default: "" },
    dotAgency: { type: String, default: "" },

    sendLink: { type: Boolean, default: false },
    donorPass: { type: Boolean, default: true },
    observed: { type: Boolean, default: false },

    orderExpiresInput: { type: String, default: "" }, // raw UI value
    expirationDateTime: { type: String, default: "" }, // formatted for vendor
    orderReferenceNumber: { type: String, default: "" },
    schedulingUrl: { type: String, default: "" },

    // Emails
    toEmail: { type: String, default: "" },
    ccEmail: { type: String, default: "" },
    allEmails: { type: String, default: "" },

    // Snapshots
    participant: participantSchema,
    address: addressSchema,

    // Site workflow
    siteSearch: {
      searchRadius: { type: String, default: "" },
      postalCode: { type: String, default: "" },
      country: { type: String, default: "" },
    },
    lastSearchZip: { type: String, default: "" },
    selectedSite: siteSchema,

    // Vendor echo payloads (for audit/debug)
    vendorCreatePayload: mongoose.Schema.Types.Mixed,
    vendorCreateResponse: mongoose.Schema.Types.Mixed,
    vendorSitesPayload: mongoose.Schema.Types.Mixed,
    vendorSitesResponseMeta: mongoose.Schema.Types.Mixed,
    vendorSchedulePayload: mongoose.Schema.Types.Mixed,

    // Traceability
    createdBy: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Result", resultSchema);
