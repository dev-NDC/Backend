const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  date: Date,
  documentFile: Buffer,
  filename: String,
  mimeType: String,
}, { timestamps: true });

module.exports = mongoose.model("Document", documentSchema);
