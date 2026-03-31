const express = require('express');
const router = express.Router();
const machinesController = require('../controllers/machinesController');
const auth = require('../middlewares/auth');
const { requireDbConnected } = require('../middlewares/securityGuards');

// GET /api/machines - Fetch all machines (optionally filtered by storeId)
router.get('/', machinesController.getMachines);

// POST /api/machines - Create a new machine
router.post('/', auth, requireDbConnected, machinesController.createMachine);

module.exports = router;
