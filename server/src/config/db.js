const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas using Mongoose.
 * Credentials are read securely from process.env.MONGO_URI.
 */
let isConnecting = false;

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('[Database] Connection Error: MONGO_URI is not defined in environment variables.');
    return null;
  }

  if (isConnecting || mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  isConnecting = true;

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 6000,
    });
    console.log(`[Database] MongoDB Atlas connected successfully: ${conn.connection.host}`);
    isConnecting = false;
    return conn;
  } catch (error) {
    isConnecting = false;
    console.error(`[Database] MongoDB connection error: ${error.message}`);
    console.warn('[Database] Tip: Ensure your current IP or 0.0.0.0/0 is whitelisted in MongoDB Atlas Network Access.');
    console.warn('[Database] The server will remain active and attempt reconnection on subsequent requests.');
    return null;
  }
};

// Monitor connection events
mongoose.connection.on('disconnected', () => {
  console.log('[Database] MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('[Database] MongoDB reconnected successfully.');
});

module.exports = connectDB;

