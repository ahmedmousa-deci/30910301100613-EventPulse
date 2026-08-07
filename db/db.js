const mongoose = require("mongoose");

/**
 * Connecting to the database, Requires the url to connect
 * @param {string} url
 */
async function connectDB(url) {
  try {
    await mongoose.connect(url);
    console.log("connected");
  } catch (e) {
    console.log("connection failed");
    console.error(e);
    process.exit(1);
  }
}

module.exports = connectDB;
