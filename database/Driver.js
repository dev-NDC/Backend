const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // link to User or Company
  government_id: String,
  first_name: String,
  last_name: String,
  phone: String,
  email: String,
  postal_code: String,
  region: String,
  municipality: String,
  address: String,
  dob: String,
  isActive: { type: Boolean, default: false },
  creationDate: String,
  createdBy: String,
  deletedBy: String,
  deletionDate: String,
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Driver", driverSchema);
