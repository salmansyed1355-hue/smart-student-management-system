const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  date: {
    type: Date,
    required: [true, 'Attendance date is required'],
    // Normalize date to UTC midnight so time differences don't bypass unique constraint
    set: function (val) {
      if (!val) return val;
      const d = new Date(val);
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['Present', 'Absent', 'Late'],
      message: 'Status must be Present, Absent, or Late'
    }
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: prevents duplicate attendance for the same student + date + subject
attendanceSchema.index({ studentId: 1, date: 1, subject: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
