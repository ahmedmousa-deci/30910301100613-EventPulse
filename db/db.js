const mongoose = require("mongoose");

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB with connection caching for serverless environments.
 * @param {string} [url] - MongoDB connection string.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB(url = process.env.MONGO_URL) {
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!url) {
    console.warn("MONGO_URL environment variable is not defined.");
    return null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose
      .connect(url, opts)
      .then((m) => {
        console.log("MongoDB connected successfully");
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        console.error("MongoDB connection failed:", err.message);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
