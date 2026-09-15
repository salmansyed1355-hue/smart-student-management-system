const mongoose = require('mongoose');

// Define the blueprint (Schema) for student documents in MongoDB
const studentSchema = new mongoose.Schema({
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    unique: true,
    trim: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  batchYear: {
    type: Number,
    required: [true, 'Batch year is required']
  },
  status: {
    type: String,
    enum: {
      values: ['Active', 'Graduated', 'Suspended'],
      message: 'Status must be Active, Graduated, or Suspended'
    },
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compile the schema into a Mongoose Model
// Mongoose will automatically map this to the 'students' collection in MongoDB
const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
