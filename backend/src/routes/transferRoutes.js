const express = require('express');
const router = express.Router();
const transferController = require('../controllers/transferController');
const auth = require('../middlewares/auth');
const { requireDbConnected } = require('../middlewares/securityGuards');

// POST /api/transfers - Create a new transfer
router.post('/', auth, requireDbConnected, transferController.createTransfer);

// GET /api/transfers - Get all transfers with optional filters
router.get('/', transferController.getTransfers);

// GET /api/transfers/stats - Get transfer statistics
router.get('/stats', transferController.getTransferStats);

// PATCH /api/transfers/:id/receive - Mark in-transit shipment as received
router.patch('/:id/receive', auth, requireDbConnected, transferController.markTransferReceived);
// PATCH /api/transfers/:id/mark-received - Mark incoming shipment as received
router.patch('/:id/mark-received', auth, requireDbConnected, transferController.markTransferReceived);
// PUT /api/transfers/:id/receive - Mark in-transit shipment as received
router.put('/:id/receive', auth, requireDbConnected, transferController.markTransferReceived);

// PATCH /api/transfers/:id/approve - Approve shipment and optionally mark as received
router.patch('/:id/approve', auth, requireDbConnected, transferController.approveTransfer);

// GET /api/transfers/:id - Get transfer by ID
router.get('/:id', transferController.getTransferById);

module.exports = router;
