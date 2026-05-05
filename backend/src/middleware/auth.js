const jwt = require('jsonwebtoken');

// Verify JWT token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

// Role-based access: Admin only
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required.' });
  }
  next();
};

// Role-based access: Admin or Member (any authenticated user)
const isMember = (req, res, next) => {
  if (!['ADMIN', 'MEMBER'].includes(req.user.role)) {
    return res.status(403).json({ error: 'Access denied.' });
  }
  next();
};

module.exports = { verifyToken, isAdmin, isMember };
