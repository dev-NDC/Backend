const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const {
  createNewOrderSchema,
  driverSchema,
  packageAndOrderSchema,
} = require("./moreSchema");

// Certificate schema
const certificateSchema = new mongoose.Schema({
  description: String,
  issueDate: Date,
  expirationDate: Date,
  certificateFile: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });

// Random schema
const randomSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4'],
    required: true,
  },
  company: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }
  },
  driver: {
    _id: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true }
  },
  testType: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Scheduled'],
    default: 'Pending'
  }
}, { _id: true });

// Document schema
const documentSchema = new mongoose.Schema({
  description: String,
  date: Date,
  documentFile: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });

// Invoice schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  amount: Number,
  date: Date,
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Pending'],
    default: 'Pending'
  },
  file: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });

// Result schema
const resultSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId },
  caseNumber: String,
  date: Date,
  testType: String,
  status: String,
  file: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });

// Membership schema
const MembershipSchema = new mongoose.Schema({
  price: Number,
  planName: String,
  selectedPlan: Number,
  planStartDate: Date,
  planEndDate: Date,
  orgId: String,
  locationCode: String,
  planStatus: {
    type: String,
    enum: ['Active', 'Inactive', 'Pending'],
    default: 'Pending',
  },
  package: [{ package_name: String }],
  order_reason: [{ order_reason_name: String }],
}, { _id: true });

// =======================
// Main User Schema
// =======================
const userSchema = new mongoose.Schema({
  // Personal info
  contactInfoData: {
    firstName: String,
    lastName: String,
    phone: String,
    email: { type: String, unique: true, required: true },
    password: String,
  },

  // Company info
  companyInfoData: {
    companyName: String,
    usdot: String,
    contactNumber: String,
    companyEmail: String,
    safetyAgencyName: String,
    employees: String,
    address: String,
    suite: String,
    city: String,
    state: String,
    zip: String,
    driverCount: String,
  },

  // Payment info
  paymentData: {
    creditCardNumber: String,
    cvv: String,
    expMonth: Number,
    expYear: Number,
    billingZip: String,
    accountNumber: String,
    routingNumber: String,
    accountName: String,
    accountType: {
      type: String,
      enum: ['Checking', 'Saving', 'Consumer', 'Business'],
      default: 'Saving'
    },
  },

  // Form submission
  submitFormData: {
    firstName: String,
    lastName: String,
    date: String,
    signature: String,
    agree: Boolean,
  },

  
  // admin notes for users
  notes: [{
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],

  // Related entities
  drivers: [driverSchema],
  order: [createNewOrderSchema],
  packageAndOrder: packageAndOrderSchema,
  results: [resultSchema],
  invoices: [invoiceSchema],
  certificates: [certificateSchema],
  documents: [documentSchema],
  Membership: MembershipSchema,
  randoms: [randomSchema],

  // Password reset
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

// =======================
// Password Hash Middleware
// =======================
userSchema.pre("save", async function (next) {
  if (!this.isModified("contactInfoData.password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.contactInfoData.password = await bcrypt.hash(this.contactInfoData.password, salt);
  next();
});

module.exports = mongoose.model("User", userSchema);
