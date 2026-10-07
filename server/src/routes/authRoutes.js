const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const User = require('../models/User');
const Student = require('../models/Student');
const AllowedFaculty = require('../models/AllowedFaculty');
const ActivityLog = require('../models/ActivityLog');
const { protect } = require('../middleware/authMiddleware');

// Helper to generate signed JWT token with role and studentId
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: (user.role || 'faculty').toLowerCase(),
      studentId: user.studentId || null
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '7d'
    }
  );
};

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user and return JWT
 * @access  Public
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role = 'faculty', rollNumber, studentId } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    // 2. Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRole = role.toLowerCase().trim();

    // 3. Security: If registering as faculty, check authorized faculty whitelist
    if (normalizedRole === 'faculty') {
      const isAllowed = await AllowedFaculty.isAllowed(normalizedEmail);
      if (!isAllowed) {
        await ActivityLog.logActivity({
          email: normalizedEmail,
          name: name.trim(),
          role: 'faculty',
          action: 'signup_denied',
          status: 'denied',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
          details: 'Faculty signup blocked: email is not on the authorized whitelist'
        });

        return res.status(403).json({
          success: false,
          message: 'Access Denied: This email is not authorized for faculty registration. Only approved faculty emails (configured by salmansyed@gmail.com) can register.'
        });
      }
    }

    // 4. Check for existing user with same email
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // 5. Validate role
    if (!['faculty', 'student'].includes(normalizedRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either faculty or student.'
      });
    }

    // 5. If registering as a student, resolve and verify student record
    let linkedStudentId = null;
    if (normalizedRole === 'student') {
      let studentDoc = null;
      if (rollNumber) {
        studentDoc = await Student.findOne({ rollNumber: rollNumber.trim().toUpperCase() });
      } else if (studentId) {
        studentDoc = await Student.findById(studentId);
      } else {
        studentDoc = await Student.findOne({ email: email.toLowerCase().trim() });
      }

      // If no student record exists with given identifiers
      if (!studentDoc) {
        return res.status(404).json({
          success: false,
          message: 'Student record not found. Please verify your roll number or contact college administration.'
        });
      }

      // FIX 1: Verify signup email matches official student record email exactly
      const normalizedSignupEmail = email.toLowerCase().trim();
      const officialEmail = (studentDoc.email || '').toLowerCase().trim();
      if (normalizedSignupEmail !== officialEmail) {
        return res.status(403).json({
          success: false,
          message: 'Student email does not match the official email registered for this roll number.'
        });
      }

      // FIX 2: Enforce strictly ONE User account per Student record
      const existingStudentAccount = await User.findOne({ studentId: studentDoc._id });
      if (existingStudentAccount) {
        return res.status(409).json({
          success: false,
          message: 'A student portal account has already been registered for this student record. Please sign in instead.'
        });
      }

      linkedStudentId = studentDoc._id;
    }

    // 6. Create new user document (pre-save hook hashes password with bcrypt)
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: normalizedRole,
      studentId: linkedStudentId
    });

    await user.save();

    // 7. Log successful registration in ActivityLog
    await ActivityLog.logActivity({
      email: user.email,
      name: user.name,
      role: user.role,
      action: 'signup',
      status: 'success',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: `New ${user.role} user registered`
    });

    // 8. Generate JWT token
    const token = generateToken(user);

    // 9. Return response (excluding password)
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      if (error.keyPattern?.studentId || error.keyValue?.studentId) {
        return res.status(409).json({
          success: false,
          message: 'A student portal account has already been registered for this student record.'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    console.error(`[Error] Signup error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during signup.'
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user, compare bcrypt password, validate selected role, and return JWT
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Validate inputs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    // 2. Find user by email
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 3. Verify password using bcrypt compare
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const userRole = (user.role || 'faculty').toLowerCase();

    // 4. Role validation if role is specified in request
    if (role && role.toLowerCase().trim() !== userRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Your account is registered as "${userRole.toUpperCase()}", not "${role.toUpperCase()}".`
      });
    }

    // 5. Security: If logging in as faculty, verify against AllowedFaculty whitelist
    if (userRole === 'faculty') {
      const isAllowed = await AllowedFaculty.isAllowed(user.email);
      if (!isAllowed) {
        await ActivityLog.logActivity({
          email: user.email,
          name: user.name,
          role: 'faculty',
          action: 'login_denied',
          status: 'denied',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
          details: 'Faculty login blocked: email is not authorized on whitelist'
        });

        return res.status(403).json({
          success: false,
          message: 'Access Denied: Your email is not authorized for faculty access. Only approved faculty emails (managed by salmansyed@gmail.com) are permitted.'
        });
      }
    }

    // If user is a student but has no studentId yet, try to auto-link via matching email
    if (userRole === 'student' && !user.studentId) {
      const studentMatch = await Student.findOne({ email: user.email });
      if (studentMatch) {
        user.studentId = studentMatch._id;
        await user.save();
      }
    }

    // 6. Log successful login in ActivityLog
    await ActivityLog.logActivity({
      email: user.email,
      name: user.name,
      role: userRole,
      action: 'login',
      status: 'success',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'Browser',
      details: 'Portal authentication successful'
    });

    // 7. Generate JWT token
    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: userRole,
        studentId: user.studentId || null
      }
    });
  } catch (error) {
    console.error(`[Error] Login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error during login.'
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get currently logged-in user profile from JWT
 * @access  Private (Protected by authMiddleware)
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    // Record website session activity (throttled to once every 2 minutes per user)
    try {
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      const recentLog = await ActivityLog.findOne({
        email: user.email.toLowerCase().trim(),
        timestamp: { $gte: twoMinutesAgo }
      });

      if (!recentLog) {
        await ActivityLog.logActivity({
          email: user.email,
          name: user.name,
          role: user.role || 'faculty',
          action: 'website_visit',
          status: 'success',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
          userAgent: req.headers['user-agent'] || 'Browser',
          details: 'Active website session / Portal visit'
        });
      }
    } catch (logErr) {
      // Safe non-blocking log
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'faculty',
        studentId: user.studentId || null
      }
    });
  } catch (error) {
    console.error(`[Error] Get current user error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile.'
    });
  }
});

module.exports = router;
