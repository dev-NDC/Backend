const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
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
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
