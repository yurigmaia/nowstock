// routes/inventoryRoutes.js 

const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); 

// ENDPOINT: GET /api/inventory - Lista todo o inventário (Requer implementação no Model)
router.get('/', inventoryController.getInventory);

// ENDPOINT: POST /api/inventory/simulate-rfid - Simulação de Leitura RFID
router.post('/simulate-rfid', inventoryController.simulateRfidScan);

module.exports = router;