const mongoose = require('mongoose');

const requireDbConnected = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  console.error('Critical write blocked: database disconnected', {
    at: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl
  });

  return res.status(503).json({
    success: false,
    message: 'Database is unavailable. Write operations are temporarily disabled.'
  });
};

module.exports = {
  requireDbConnected
};
