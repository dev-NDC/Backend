const mongoose = require("mongoose");

const MONGO_URI = "mongodb://127.0.0.1:27017/NDC";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI); // No extra options needed
    console.log("MongoDB Connected Successfully!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

connectDB();
