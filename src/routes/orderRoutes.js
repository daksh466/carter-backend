const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const authenticateToken = require('../middlewares/auth');

router.post('/', authenticateToken, orderController.createOrder);
router.get('/', orderController.listOrders);

module.exports = router;
