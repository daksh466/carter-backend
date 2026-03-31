const express = require('express');
const router = express.Router();
const sparePartsController = require('../controllers/sparePartsController');
const auth = require('../middlewares/auth');
const { requireDbConnected } = require('../middlewares/securityGuards');

// GET /api/spares - Fetch all spare parts (optionally filtered by storeId or machineId)
router.get('/', sparePartsController.getSpareParts);

// POST /api/spares - Create a new spare part
router.post('/', auth, requireDbConnected, sparePartsController.createSparePart);

// POST /api/spares/merge-duplicates - Merge duplicate spare parts by normalized item name
router.post('/merge-duplicates', auth, requireDbConnected, sparePartsController.mergeDuplicateSpareParts);

// DELETE /api/spares/:id - Delete a spare part by ID
router.delete('/:id', auth, requireDbConnected, sparePartsController.deleteSparePart);

module.exports = router;
