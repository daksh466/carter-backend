const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// PUT /service/:id
router.put('/:id', serviceController.updateService);
// DELETE /service/:id
router.delete('/:id', serviceController.deleteService);

module.exports = router;
