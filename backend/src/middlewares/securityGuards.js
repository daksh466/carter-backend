const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { jwtSecret } = require('../config');

const isProduction = () => String(process.env.NODE_ENV || '').toLowerCase() === 'production';
const allowUnsafeBypass = () => {
  if (isProduction()) return false;
  const raw = String(process.env.ALLOW_UNSAFE_DESTRUCTIVE_AUTH_BYPASS || 'true').trim().toLowerCase();
  return !(raw === 'false' || raw === '0' || raw === 'no');
};

const logSecurityEvent = (level, message, meta = {}) => {
  const payload = {
    at: new Date().toISOString(),
    ...meta
  };
  if (level === 'error') {
    console.error(message, payload);
    return;
  }
  console.warn(message, payload);
};

const parseBearerToken = (req) => {
  const authHeader = req.headers?.authorization || '';
  if (!authHeader.startsWith('Bearer ')) return '';
  return authHeader.slice(7).trim();
};

const requireDestructiveAuth = (req, res, next) => {
  // TEMP: Disabled authentication middleware for production demo (all routes public)
  // Set mock user for any code expecting req.user
  req.user = req.user || { id: 'demo-public-user', role: 'public-demo' };
  console.log('Auth bypassed for demo', { method: req.method, path: req.originalUrl });
  return next();
};

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
  requireDestructiveAuth,
  requireDbConnected
};
