const express = require('express');
const router = express.Router();
const purchaseOrdersController = require('../controllers/purchaseOrdersController');
const { requireDestructiveAuth, requireDbConnected } = require('../middlewares/securityGuards');

// POST /api/purchase-orders - Create new purchase order (auto-updates inventory)
router.post('/', requireDbConnected, purchaseOrdersController.createPurchaseOrder);

// GET /api/purchase-orders - Get all (filter by store/status)
router.get('/', purchaseOrdersController.getPurchaseOrders);

// DELETE /api/purchase-orders/:id - Delete purchase order
router.delete('/:id', requireDbConnected, purchaseOrdersController.deletePurchaseOrder);

// PUT /api/purchase-orders/:id/status - Update status
router.put('/:id/status', requireDbConnected, purchaseOrdersController.updatePurchaseOrderStatus);

module.exports = router;
