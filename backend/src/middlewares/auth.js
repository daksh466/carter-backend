const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const authHeader = String(req.headers.authorization || '').trim();
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return res.status(401).json({ success: false, message: 'Authorization token missing' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

module.exports = auth;