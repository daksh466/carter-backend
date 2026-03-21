const winston = require('winston');
const { format } = winston;
const path = require('path');

// Ensure logs directory exists (create_file auto-handles dirs, but explicit)
const logDir = path.join(__dirname, '..', 'logs');
const errorLogFile = path.join(logDir, 'error.log');
const combinedLogFile = path.join(logDir, 'combined.log');

// Custom format
const customFormat = format.printf(({ timestamp, level, message, meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${meta ? JSON.stringify(meta) : ''}`;
});

// Transports
const transports = [
  new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      customFormat
    )
  }),
  new winston.transports.File({
    filename: errorLogFile,
    level: 'error',
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json()
    )
  }),
  new winston.transports.File({
    filename: combinedLogFile,
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.errors({ stack: true }),
      format.json()
    )
  })
];

// Logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'carter-crm-backend' },
  transports
});

// HTTP request logger middleware (replaces morgan)
const httpLogger = format.printf(({ timestamp, level, message, req, res }) => {
  const { method, url, httpVersion } = req;
  const { statusCode } = res;
  const contentLength = res.get('content-length');
  const userId = req.user?.id || 'anonymous';
  const responseTime = res.responseTime || 'N/A';

  return `${timestamp} [${level.toUpperCase()}] HTTP ${method} ${url} ${statusCode} ${contentLength} ${responseTime}ms user:${userId}`;
});

const httpMiddleware = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;
    res.responseTime = responseTime;
    logger.http(`HTTP ${req.method} ${req.route?.path || req.path} - ${res.statusCode} - ${responseTime}ms`, {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      userId: req.user?.id || 'anonymous',
      responseTime
    });
  });
  next();
};

module.exports = {
  logger,
  httpLogger: httpMiddleware
};

