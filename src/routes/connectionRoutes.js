const express = require('express');
const router = express.Router();
const connectionController = require('../controllers/connectionController');

router.post('/', connectionController.createConnection);
router.get('/', connectionController.listConnections);
router.get('/:id/details', connectionController.getCustomerDetails);

module.exports = router;
