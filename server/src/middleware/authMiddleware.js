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

      // Attach decoded payload (user id, email) to request
      req.user = decoded;

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

module.exports = { protect };
