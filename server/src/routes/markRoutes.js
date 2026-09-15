const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Mark = require('../models/Mark');
const Student = require('../models/Student');

/**
 * @route   GET /api/marks
 * @desc    Fetch marks records with populated student details and optional filters
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { studentId, subject, examType } = req.query;
    const filter = {};

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid student ID filter.'
        });
      }
      filter.studentId = studentId;
    }

    if (subject) {
      filter.subject = subject.trim();
    }

    if (examType) {
      filter.examType = examType.trim();
    }

    const marks = await Mark.find(filter)
      .populate('studentId', 'rollNumber fullName department semester')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: marks.length,
      data: marks
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch marks: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching marks.'
    });
  }
});

/**
 * @route   POST /api/marks
 * @desc    Record marks for a student in a subject and exam type
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    const { studentId, subject, examType, maxMarks, obtainedMarks } = req.body;

    // 1. Validate required fields
    if (!studentId || !subject || !examType || maxMarks === undefined || obtainedMarks === undefined) {
      return res.status(400).json({
        success: false,
        message: 'All fields (studentId, subject, examType, maxMarks, obtainedMarks) are required.'
      });
    }

    // 2. Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    // 3. Verify student exists in MongoDB Atlas
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Referenced student does not exist.'
      });
    }

    // 4. Validate marks values
    const numMax = Number(maxMarks);
    const numObtained = Number(obtainedMarks);

    if (isNaN(numMax) || numMax < 1) {
      return res.status(400).json({
        success: false,
        message: 'Maximum marks must be a number greater than 0.'
      });
    }

    if (isNaN(numObtained) || numObtained < 0) {
      return res.status(400).json({
        success: false,
        message: 'Obtained marks cannot be negative.'
      });
    }

    if (numObtained > numMax) {
      return res.status(400).json({
        success: false,
        message: 'Obtained marks cannot exceed maximum marks.'
      });
    }

    // 5. Create and save mark record
    const newMark = new Mark({
      studentId,
      subject: subject.trim(),
      examType: examType.trim(),
      maxMarks: numMax,
      obtainedMarks: numObtained
    });

    const savedMark = await newMark.save();

    // Populate student information for immediate response
    await savedMark.populate('studentId', 'rollNumber fullName department semester');

    res.status(201).json({
      success: true,
      message: 'Marks recorded successfully.',
      data: savedMark
    });
  } catch (error) {
    // Handle compound unique index duplicate error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Marks have already been recorded for this student in this subject and exam type.'
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    console.error(`[Error] Failed to record marks: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while recording marks.'
    });
  }
});

/**
 * @route   GET /api/marks/student/:studentId
 * @desc    Fetch all marks and calculated percentage summary for a specific student
 * @access  Public
 */
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    // Verify student exists
    const student = await Student.findById(studentId).select('rollNumber fullName department semester');
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.'
      });
    }

    // Fetch marks records for this student, newest first
    const records = await Mark.find({ studentId }).sort({ createdAt: -1 });

    // Calculate summary statistics
    const totalExams = records.length;
    let totalObtained = 0;
    let totalMax = 0;

    records.forEach((r) => {
      totalObtained += r.obtainedMarks;
      totalMax += r.maxMarks;
    });

    const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100 * 10) / 10 : 0;

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalExams,
        totalObtained,
        totalMax,
        overallPercentage
      },
      data: records
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch student marks: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student marks.'
    });
  }
});

module.exports = router;
