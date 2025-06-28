const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, required: true, unique: true },
    contact: String,
    password: { type: String, required: true },
    isSuperAdmin: { type: Boolean, default: false },
    // Password reset
    resetToken: String,
    resetTokenExpiry: Date,
}, { timestamps: true });

// Password hashing
adminSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});
module.exports = mongoose.model("Admin", adminSchema);
