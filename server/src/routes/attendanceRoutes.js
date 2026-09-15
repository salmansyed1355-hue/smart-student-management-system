const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

/**
 * @route   GET /api/attendance
 * @desc    Fetch all attendance records with populated student details
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { date, subject } = req.query;
    const filter = {};

    if (date) {
      const d = new Date(date);
      const normalizedDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
      filter.date = normalizedDate;
    }

    if (subject) {
      filter.subject = subject.trim();
    }

    const records = await Attendance.find(filter)
      .populate('studentId', 'rollNumber fullName department semester')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch attendance: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records.'
    });
  }
});

/**
 * @route   POST /api/attendance
 * @desc    Mark attendance for a student (or batch for a classroom)
 * @access  Public
 */
router.post('/', async (req, res) => {
  try {
    // Check if this is a batch submission from a teacher class sheet: { date, subject, records: [{ studentId, status }, ...] }
    if (req.body.records && Array.isArray(req.body.records)) {
      const { date, subject, records } = req.body;

      if (!date || !subject) {
        return res.status(400).json({
          success: false,
          message: 'Date and subject are required for batch attendance.'
        });
      }

      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No student attendance records provided.'
        });
      }

      const results = [];
      const errors = [];

      for (const item of records) {
        try {
          if (!mongoose.Types.ObjectId.isValid(item.studentId)) {
            errors.push(`Invalid student ID: ${item.studentId}`);
            continue;
          }

          // Verify student exists
          const studentExists = await Student.findById(item.studentId);
          if (!studentExists) {
            errors.push(`Student not found: ${item.studentId}`);
            continue;
          }

          // Upsert or insert attendance record so teachers can safely re-mark without error
          const d = new Date(date);
          const normalizedDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

          const updated = await Attendance.findOneAndUpdate(
            { studentId: item.studentId, date: normalizedDate, subject: subject.trim() },
            { status: item.status },
            { new: true, upsert: true, runValidators: true }
          );

          results.push(updated);
        } catch (itemErr) {
          errors.push(itemErr.message);
        }
      }

      return res.status(201).json({
        success: true,
        message: `Attendance recorded for ${results.length} student(s).`,
        count: results.length,
        errors: errors.length > 0 ? errors : undefined,
        data: results
      });
    }

    // Single student attendance submission
    const { studentId, date, status, subject } = req.body;

    // 1. Validate required fields
    if (!studentId || !date || !status || !subject) {
      return res.status(400).json({
        success: false,
        message: 'All fields (studentId, date, status, subject) are required.'
      });
    }

    // 2. Validate studentId format
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid student ID format.'
      });
    }

    // 3. Verify student exists in MongoDB
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Referenced student does not exist.'
      });
    }

    // 4. Create attendance document
    const newAttendance = new Attendance({
      studentId,
      date,
      status,
      subject
    });

    const savedAttendance = await newAttendance.save();

    res.status(201).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: savedAttendance
    });
  } catch (error) {
    // Handle compound unique index duplicate error (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for this student on this date and subject.'
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

    console.error(`[Error] Failed to create attendance: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while recording attendance.'
    });
  }
});

/**
 * @route   GET /api/attendance/student/:studentId
 * @desc    Fetch attendance history and calculated summary statistics for a specific student
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

    // Fetch attendance records for this student, sorted newest first
    const records = await Attendance.find({ studentId }).sort({ date: -1, createdAt: -1 });

    // Calculate summary statistics
    const totalClasses = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((present / totalClasses) * 100) : 0;

    res.status(200).json({
      success: true,
      student,
      summary: {
        totalClasses,
        present,
        absent,
        late,
        attendancePercentage
      },
      data: records
    });
  } catch (error) {
    console.error(`[Error] Failed to fetch student attendance history: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student attendance history.'
    });
  }
});

module.exports = router;
