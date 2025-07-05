const mongoose = require("mongoose");

const randomSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver', required: true },
    name: { type: String, required: true }
  },
  testType: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Scheduled'],
    default: 'Pending'
  }
}, { timestamps: true });

module.exports = mongoose.model("Random", randomSchema);
