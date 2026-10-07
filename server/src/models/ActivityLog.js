const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  name: {
    type: String,
    default: '',
    trim: true
  },
  role: {
    type: String,
    enum: ['faculty', 'student', 'unknown'],
    default: 'unknown'
  },
  action: {
    type: String,
    default: 'login', // 'login', 'signup', 'access_denied', etc.
    trim: true
  },
  status: {
    type: String,
    enum: ['success', 'denied', 'failed'],
    default: 'success'
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: 'Unknown Device'
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Helper static method for safe non-blocking logging
activityLogSchema.statics.logActivity = async function (data) {
  try {
    return await this.create({
      email: (data.email || 'unknown').toLowerCase().trim(),
      name: data.name || '',
      role: (data.role || 'unknown').toLowerCase(),
      action: data.action || 'login',
      status: data.status || 'success',
      ipAddress: data.ipAddress || '127.0.0.1',
      userAgent: data.userAgent || 'Web Browser',
      details: data.details || '',
      timestamp: new Date()
    });
  } catch (err) {
    console.error(`[ActivityLog] Failed to record log: ${err.message}`);
    return null;
  }
};

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;
