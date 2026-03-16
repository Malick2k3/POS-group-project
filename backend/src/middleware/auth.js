const jwt = require('jsonwebtoken');

function extractToken(req) {
  const header = req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

function verifyToken(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'development-pos-secret-change-me'
    );

    req.user = {
      id: decoded.id || decoded.userId,
      role: decoded.role,
      email: decoded.email
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired authentication token' });
  }
}

function checkRole(roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have access to this resource' });
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  auth: verifyToken,
  checkRole
};
