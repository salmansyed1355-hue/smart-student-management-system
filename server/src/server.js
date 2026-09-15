const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing so React (port 5173) can talk to Express (port 5000)
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

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

// Start the Express server
app.listen(PORT, () => {
  console.log(`[Server] Running on http://localhost:${PORT}`);
  console.log(`[Server] Health check endpoint: http://localhost:${PORT}/api/health`);
});
