const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const { requireDestructiveAuth, requireDbConnected } = require('../middlewares/securityGuards');



// GET all stores
router.get('/', storeController.getStores);
// GET store by id
router.get('/:id', storeController.getStoreById);
// POST create store
router.post('/', requireDbConnected, storeController.addStore);
// PUT update store
router.put('/:id', requireDbConnected, storeController.updateStore);
// DELETE store
router.delete('/:id', requireDbConnected, storeController.deleteStore);

module.exports = router;
