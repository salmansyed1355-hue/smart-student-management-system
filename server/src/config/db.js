const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using Mongoose.
 * Credentials are read securely from process.env.MONGO_URI.
 */
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('[Database] Connection Error: MONGO_URI is not defined in environment variables.');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
