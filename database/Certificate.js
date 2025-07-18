const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: String,
  issueDate: Date,
  expirationDate: Date,
  certificateFile: Buffer,
  filename: String,
  mimeType: String,
}, { timestamps: true });

certificateSchema.set("toJSON", {
  transform: function (doc, ret) {
    if (ret.certificateFile) {
      ret.certificateFile = ret.certificateFile.toString("base64");
    }
    return ret;
  },
});


module.exports = mongoose.model("Certificate", certificateSchema);
