const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// createNewOrderSchema schema
const createNewOrderSchema = new mongoose.Schema({
    case_number: String,
    direct_url: String,
    order_reference_number: String,
}, { _id: true });


// Package and OrderSchema
const packageAndOrderSchema = new mongoose.Schema({
    package: [{
        package_name: String,
    }],
    order_reason: [{
        order_reason_name: String,
    }],
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
    timestamp: { type: Date, default: Date.now },
    addedBy : String,
  }],

  // Related entities
  order: [createNewOrderSchema],
  packageAndOrder: packageAndOrderSchema,
  Membership: MembershipSchema,

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
