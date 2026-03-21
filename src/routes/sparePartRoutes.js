const express = require('express');
const router = express.Router();
const sparePartController = require('../controllers/sparePartController');

// PUT /spare/:id
router.put('/:id', sparePartController.updateSparePart);
// DELETE /spare/:id
router.delete('/:id', sparePartController.deleteSparePart);

module.exports = router;
