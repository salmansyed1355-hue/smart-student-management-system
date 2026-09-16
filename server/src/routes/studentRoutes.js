const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Student = require('../models/Student');
const { protect, requireFaculty, requireStudent } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/students/me
 * @desc    Fetch own student profile linked to authenticated student account
 * @access  Private (Student only)
 */
router.get('/me', protect, requireStudent, async (req, res) => {
  try {
    if (!req.user.studentId) {
      return res.status(404).json({
        success: false,
        message: 'No student record linked to this user account. Please contact faculty/administrator.'
      });
    }

    const student = await Student.findById(req.user.studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch own student profile: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student profile.'
    });
  }
});

/**
 * @route   GET /api/students
 * @desc    Fetch all student records from MongoDB Atlas
 * @access  Private (Faculty only)
 */
router.get('/', protect, requireFaculty, async (req, res) => {
  try {
    // Retrieve all documents from the 'students' collection, newest first
    const students = await Student.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch students: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students.'
    });
  }
});

/**
 * @route   POST /api/students
 * @desc    Create and save a new student record
 * @access  Private (Faculty only)
 */
router.post('/', protect, requireFaculty, async (req, res) => {
  try {
    const {
      rollNumber,
      fullName,
      email,
      phone,
      department,
      semester,
      batchYear,
      status
    } = req.body;

    // Create a new Student document using the Mongoose model
    const newStudent = new Student({
      rollNumber,
      fullName,
      email,
      phone,
      department,
      semester,
      batchYear,
      status
    });

    // Save the student to MongoDB Atlas (this triggers schema validation and unique checks)
    const savedStudent = await newStudent.save();

    res.status(201).json({
      success: true,
      message: 'Student created successfully.',
      data: savedStudent
    });
  } catch (error) {
    // 1. Handle duplicate key error (MongoDB error code 11000 for unique fields)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      let message = 'A student with this information already exists.';

      if (field === 'rollNumber') {
        message = 'A student with this roll number already exists.';
      } else if (field === 'email') {
        message = 'A student with this email address already exists.';
      }

      return res.status(400).json({
        success: false,
        message
      });
    }

    // 2. Handle Mongoose validation errors (e.g. missing required field, semester out of range)
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // 3. Handle unexpected server errors
    console.error(`[Error] Failed to create student: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while creating student.'
    });
  }
});

/**
 * @route   GET /api/students/:id
 * @desc    Fetch a single student record by MongoDB ID
 * @access  Private (Faculty only)
 */
router.get('/:id', protect, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch student by ID: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student.'
    });
  }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update an existing student record by MongoDB ID
 * @access  Private (Faculty only)
 */
router.put('/:id', protect, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate that the provided ID is a valid 24-character MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    // Find the student record in MongoDB Atlas
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Update fields if provided in request body
    const {
      rollNumber,
      fullName,
      email,
      phone,
      department,
      semester,
      batchYear,
      status
    } = req.body;

    if (rollNumber !== undefined) student.rollNumber = rollNumber;
    if (fullName !== undefined) student.fullName = fullName;
    if (email !== undefined) student.email = email;
    if (phone !== undefined) student.phone = phone;
    if (department !== undefined) student.department = department;
    if (semester !== undefined) student.semester = semester;
    if (batchYear !== undefined) student.batchYear = batchYear;
    if (status !== undefined) student.status = status;

    // Calling .save() executes Mongoose schema validations & unique indexes
    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully.',
      data: updatedStudent
    });
  } catch (error) {
    // Duplicate key error on rollNumber or email
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
      let message = 'A student with this information already exists.';

      if (field === 'rollNumber') {
        message = 'A student with this roll number already exists.';
      } else if (field === 'email') {
        message = 'A student with this email address already exists.';
      }

      return res.status(400).json({
        success: false,
        message
      });
    }

    // Schema validation error
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    console.error(`[Error] Failed to update student: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while updating student.'
    });
  }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student record by MongoDB ID
 * @access  Private (Faculty only)
 */
router.delete('/:id', protect, requireFaculty, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    // Find and delete the student document
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Student "${deletedStudent.fullName}" (${deletedStudent.rollNumber}) deleted successfully.`,
      data: deletedStudent
    });
  } catch (error) {
    console.error(`[Error] Failed to delete student: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting student.'
    });
  }
});

module.exports = router;

