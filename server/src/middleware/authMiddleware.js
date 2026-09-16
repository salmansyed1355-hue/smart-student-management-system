const jwt = require('jsonwebtoken');

/**
 * Middleware to authenticate requests using JWT
 * Expects header: Authorization: Bearer <token>
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from header ("Bearer <token>")
      token = req.headers.authorization.split(' ')[1];

      // Verify JWT signature using secret key from environment
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach decoded payload (user id, email, role, studentId) to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: (decoded.role || 'faculty').toLowerCase(),
        studentId: decoded.studentId || null
      };

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed or expired.'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided.'
    });
  }
};

/**
 * Reusable RBAC middleware to restrict access based on allowed roles
 * @param  {...string} allowedRoles - e.g. 'faculty', 'student'
 */
const requireRole = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, please log in.'
      });
    }

    const userRole = (req.user.role || 'faculty').toLowerCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${allowedRoles.join(' or ')} role.`
      });
    }

    next();
  };
};

module.exports = {
  protect,
  requireRole,
  requireFaculty: requireRole('faculty'),
  requireStudent: requireRole('student')
};
