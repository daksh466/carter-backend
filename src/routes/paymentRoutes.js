const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// PUT /payment/:id
router.put('/:id', paymentController.updatePayment);
// DELETE /payment/:id
router.delete('/:id', paymentController.deletePayment);

module.exports = router;
