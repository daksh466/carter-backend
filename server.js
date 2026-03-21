// --- Imports ---
const express = require('express');
const mongoose = require('mongoose');
const { logger, httpLogger } = require('./src/utils/logger');
const helmet = require('helmet');
const cors = require('cors');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const notFound = require('./src/middlewares/notFound');
const errorHandler = require('./src/middlewares/errorHandler');
const userRoutes = require('./src/routes/userRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const machineRoutes = require('./src/routes/machineRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const sparePartRoutes = require('./src/routes/sparePartRoutes');
const serviceRoutes = require('./src/routes/serviceRoutes');
const connectionRoutes = require('./src/routes/connectionRoutes');
const healthRoutes = require('./src/routes/healthRoutes');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { port, mongoUri } = require('./src/config');
const app = express();

// Import models
const User = require('./src/models/User');
const Machine = require('./src/models/Machine');
const Payment = require('./src/models/Payment');
const SparePart = require('./src/models/SparePart');
const Service = require('./src/models/Service');
const Inventory = require('./src/models/Inventory');
const Connection = require('./src/models/Connection');
const Order = require('./src/models/Order');
const StockMovement = require('./src/models/StockMovement');

// Ensure PDF storage directory exists
const pdfDir = path.join(__dirname, 'pdfs');
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

app.use(helmet());
app.use(httpLogger);
app.use(cors());
app.use(express.json());

// Rate limiter: 100 requests per 15 minutes per IP
const rateLimiter = new RateLimiterMemory({ points: 100, duration: 900 });
app.use(async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({ success: false, message: 'Too many requests' });
  }
});

// Register all routes
app.use('/api/health', healthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/spareparts', sparePartRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/connections', connectionRoutes);

// Error handling middleware (after routes)
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB only in non-test environments
if (process.env.NODE_ENV !== 'test') {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      app.listen(port, () => {
        logger.info(`Server running on port ${port}`);
      });
    })
    .catch(err => {
      logger.error('MongoDB connection error', err);
    });
}



// Basic Auth Middleware (optional, for demo)


// Inventory routes now handled via /api/inventory/*

// Engineer can update service
// Service routes now handled via /api/services/*

// Customer details now handled via /api/connections/:id/details

// Track consumption
// Inventory consume now handled via /api/inventory/:id/consume




// Machine PUT/DELETE now handled via /api/machines/:id

// Payment PUT/DELETE now handled via /api/payments/:id

// SparePart PUT/DELETE now handled via /api/spareparts/:id

// Service











// }

// --- End Machine Health API Sample Usage ---

// --- Export app for Jest compatibility ---
module.exports = app;

