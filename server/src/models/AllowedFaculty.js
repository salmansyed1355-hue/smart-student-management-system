const mongoose = require('mongoose');

const allowedFacultySchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Faculty email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email address'
    ]
  },
  name: {
    type: String,
    trim: true,
    default: ''
  },
  addedBy: {
    type: String,
    default: 'salmansyed@gmail.com',
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Primary Root Super-Admin Email
const PRIMARY_ADMIN_EMAIL = 'salmansyed@gmail.com';

/**
 * Check if a given email is authorized for faculty access.
 * The primary admin 'salmansyed@gmail.com' is always authorized.
 */
allowedFacultySchema.statics.isAllowed = async function (email) {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();

  // Primary super-admin is always authorized
  if (normalizedEmail === PRIMARY_ADMIN_EMAIL) {
    return true;
  }

  // Check database whitelist
  const record = await this.findOne({ email: normalizedEmail });
  return !!record;
};

allowedFacultySchema.statics.PRIMARY_ADMIN = PRIMARY_ADMIN_EMAIL;

const AllowedFaculty = mongoose.model('AllowedFaculty', allowedFacultySchema);

module.exports = AllowedFaculty;
