const express = require('express');
const router = express.Router();
const storeOrdersController = require('../controllers/storeOrdersController');
const auth = require('../middlewares/auth');
const { requireDbConnected } = require('../middlewares/securityGuards');

// GET /api/orders
router.get('/', storeOrdersController.getOrders);

// POST /api/orders
router.post('/', auth, requireDbConnected, storeOrdersController.createOrder);

// PATCH /api/orders/:id/confirm-receive
router.patch('/:id/confirm-receive', auth, requireDbConnected, storeOrdersController.confirmReceive);

// PATCH /api/orders/:id/confirm-dispatch
router.patch('/:id/confirm-dispatch', auth, requireDbConnected, storeOrdersController.confirmDispatch);

module.exports = router;
