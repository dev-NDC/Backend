const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const agencySchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  contactNumber: String,
  password: { type: String, required: true },
  agencyCode: { type: String, required: true, unique: true },

  // Password reset
  resetToken: String,
  resetTokenExpiry: Date,

  // List of handled companies with both _id and name
  handledCompanies: [{
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
}, { timestamps: true });

// Password hashing middleware
agencySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("Agency", agencySchema);
