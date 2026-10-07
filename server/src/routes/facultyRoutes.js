const express = require('express');
const router = express.Router();
const AllowedFaculty = require('../models/AllowedFaculty');
const User = require('../models/User');
const { protect, requireFaculty } = require('../middleware/authMiddleware');

// All routes in this file require valid faculty JWT authentication
router.use(protect, requireFaculty);

/**
 * @route   GET /api/faculty-access
 * @desc    Get all authorized faculty emails, status, and root admin information
 * @access  Private (Faculty only)
 */
router.get('/', async (req, res) => {
  try {
    // 1. Fetch all whitelisted faculty records
    const whitelist = await AllowedFaculty.find({}).sort({ createdAt: -1 });

    // 2. Ensure root admin 'salmansyed@gmail.com' is in list
    const hasRoot = whitelist.some((item) => item.email.toLowerCase() === AllowedFaculty.PRIMARY_ADMIN);
    let list = [...whitelist];
    if (!hasRoot) {
      list.unshift({
        _id: 'root-super-admin',
        email: AllowedFaculty.PRIMARY_ADMIN,
        name: 'Syed Salman (Primary Admin)',
        addedBy: 'System Root',
        createdAt: new Date('2026-10-01T00:00:00.000Z')
      });
    }

    // 3. Check registration status for each email against User model
    const emails = list.map((item) => item.email.toLowerCase());
    const registeredUsers = await User.find({ email: { $in: emails } }).select('email name role createdAt');
    const registeredMap = new Map();
    registeredUsers.forEach((u) => registeredMap.set(u.email.toLowerCase(), u));

    const enrichedList = list.map((item) => {
      const emailLower = item.email.toLowerCase();
      const userDoc = registeredMap.get(emailLower);
      const isPrimary = emailLower === AllowedFaculty.PRIMARY_ADMIN;

      return {
        _id: item._id,
        email: item.email,
        name: item.name || (userDoc ? userDoc.name : ''),
        addedBy: item.addedBy || 'System',
        createdAt: item.createdAt,
        isRegistered: !!userDoc,
        registeredAt: userDoc ? userDoc.createdAt : null,
        isPrimaryAdmin: isPrimary
      };
    });

    res.status(200).json({
      success: true,
      count: enrichedList.length,
      primaryAdmin: AllowedFaculty.PRIMARY_ADMIN,
      data: enrichedList
    });
  } catch (error) {
    console.error(`[Error] Fetch faculty whitelist: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching authorized faculty emails.'
    });
  }
});

/**
 * @route   POST /api/faculty-access
 * @desc    Authorize a new faculty email
 * @access  Private (Faculty only)
 */
router.post('/', async (req, res) => {
  try {
    const { email, name = '' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Faculty email address is required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.'
      });
    }

    // Check if already root admin
    if (normalizedEmail === AllowedFaculty.PRIMARY_ADMIN) {
      return res.status(400).json({
        success: false,
        message: 'This email is already the permanent primary administrator.'
      });
    }

    // Check if already in whitelist
    const existing = await AllowedFaculty.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'This email is already authorized as faculty.'
      });
    }

    // Create entry
    const newEntry = await AllowedFaculty.create({
      email: normalizedEmail,
      name: name.trim(),
      addedBy: req.user.email || 'salmansyed@gmail.com'
    });

    // Check if user account already exists in DB
    const existingUser = await User.findOne({ email: normalizedEmail });

    res.status(201).json({
      success: true,
      message: `Successfully authorized ${normalizedEmail} for faculty access.`,
      data: {
        _id: newEntry._id,
        email: newEntry.email,
        name: newEntry.name,
        addedBy: newEntry.addedBy,
        createdAt: newEntry.createdAt,
        isRegistered: !!existingUser,
        isPrimaryAdmin: false
      }
    });
  } catch (error) {
    console.error(`[Error] Authorize faculty email: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while authorizing faculty email.'
    });
  }
});

/**
 * @route   DELETE /api/faculty-access/:email
 * @desc    Revoke faculty access authorization for an email
 * @access  Private (Faculty only)
 */
router.delete('/:email', async (req, res) => {
  try {
    const targetEmail = req.params.email.toLowerCase().trim();

    // Prevent revoking the primary root admin
    if (targetEmail === AllowedFaculty.PRIMARY_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Cannot revoke access for the primary administrator account (salmansyed@gmail.com).'
      });
    }

    const deleted = await AllowedFaculty.findOneAndDelete({ email: targetEmail });
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Faculty authorization record not found for this email.'
      });
    }

    res.status(200).json({
      success: true,
      message: `Faculty authorization for ${targetEmail} has been successfully revoked.`
    });
  } catch (error) {
    console.error(`[Error] Revoke faculty email: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Server error while revoking faculty authorization.'
    });
  }
});

module.exports = router;
