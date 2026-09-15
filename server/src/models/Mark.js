const mongoose = require('mongoose');

const markSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  examType: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: {
      values: ['Internal', 'Midterm', 'Assignment', 'Final'],
      message: 'Exam type must be Internal, Midterm, Assignment, or Final'
    }
  },
  maxMarks: {
    type: Number,
    required: [true, 'Maximum marks is required'],
    min: [1, 'Maximum marks must be at least 1']
  },
  obtainedMarks: {
    type: Number,
    required: [true, 'Obtained marks is required'],
    min: [0, 'Obtained marks cannot be negative'],
    validate: {
      validator: function (value) {
        // Ensure obtained marks does not exceed maximum marks
        return value <= this.maxMarks;
      },
      message: 'Obtained marks cannot exceed maximum marks.'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound unique index: prevents duplicate marks for the same student + subject + examType
markSchema.index({ studentId: 1, subject: 1, examType: 1 }, { unique: true });

const Mark = mongoose.model('Mark', markSchema);

module.exports = Mark;
