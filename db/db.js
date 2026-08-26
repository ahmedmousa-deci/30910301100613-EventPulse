const mongoose = require("mongoose");

async function connectDB(url) {
  if (!url) return;
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    await mongoose.connect(url);
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error("MongoDB connection error:", e);
  }
}

module.exports = connectDB;

