const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Certificate schema
const certificateSchema = new mongoose.Schema({
  description: String,
  issueDate: Date,
  expirationDate: Date,
  certificateFile: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });

// Invoice schema
const invoiceSchema = new mongoose.Schema({
  invoiceNumber: String,
  amount: Number,
  date: Date,
  status: { type: String, enum: ['Paid', 'Unpaid', 'Pending'], default: 'Pending' },
  file: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });

// Result schema
const resultSchema = new mongoose.Schema({
  name: String,              // Driver Name
  licenseNumber: String,     // License #
  date: Date,
  testType: String,
  status: { type: String, enum: ['Positive', 'Negative', 'Pending'], default: 'Pending' },
  file: Buffer,
  filename: String,
  mimeType: String,
}, { _id: true });


const userSchema = new mongoose.Schema({
  selectedPlan: Number,
  role: {
    type: [String],
    enum: ['user', 'admin', 'contractor'],
    default: ['user']
  },
  contactInfoData: {
    firstName: String,
    lastName: String,
    phone: String,
    email: { type: String, unique: true, required: true },
    password: String,
  },
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
  },
  paymentData: {
    creditCardNumber: String,
    cvv: String,
    expMonth: Number,
    expYear: Number,
    billingZip: String,
    accountNumber: String,
    routingNumber: String,
    accountName: String,
    accountType: String,
  },
  submitFormData: {
    firstName: String,
    lastName: String,
    date: String,
    signature: String,
    agree: Boolean,
  },
  drivers: [{
    name: String,
    email: String,
    licenseNumber: String,
    dob: String,
    phone: String,
    creationDate: String,
    createdBy: String,
    deletionDate: String,
    isDeleted: { type: Boolean, default: false },
  }],
  results: [resultSchema],
  invoices: [invoiceSchema],
  certificates: [certificateSchema],

}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("contactInfoData.password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.contactInfoData.password = await bcrypt.hash(this.contactInfoData.password, salt);
  next();
});


const User = mongoose.model("User", userSchema);

module.exports = User;
