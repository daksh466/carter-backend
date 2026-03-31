const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');
const auth = require('../middlewares/auth');
const { requireDbConnected } = require('../middlewares/securityGuards');



// GET all stores
router.get('/', storeController.getStores);
// GET store by id
router.get('/:id', storeController.getStoreById);
// POST create store
router.post('/', auth, requireDbConnected, storeController.addStore);
// PUT update store
router.put('/:id', auth, requireDbConnected, storeController.updateStore);
// DELETE store
router.delete('/:id', auth, requireDbConnected, storeController.deleteStore);

module.exports = router;
