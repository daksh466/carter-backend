const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');

// PUT /machine/:id
router.put('/:id', machineController.updateMachine);
// DELETE /machine/:id
router.delete('/:id', machineController.deleteMachine);

module.exports = router;
