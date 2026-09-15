const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file before other imports that use process.env
dotenv.config();

const connectDB = require('./config/db');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const markRoutes = require('./routes/markRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing so React (port 5173) can talk to Express (port 5000)
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', markRoutes);

// Health-check route to verify backend is functioning properly
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Smart Student Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route for simple browser check
app.get('/', (req, res) => {
  res.send('Smart Student Management System Backend API is active.');
});

// Connect to MongoDB Atlas before starting the Express server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] Running on http://localhost:${PORT}`);
      console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

