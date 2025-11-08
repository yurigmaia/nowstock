/**
 * @file inventoryRoutes.js
 * @description
 * Define as rotas (endpoints) para consulta de inventário e simulação de RFID.
 * Todas as rotas são protegidas por autenticação e repassam o 'req'
 * completo para os controladores, permitindo o acesso ao 'req.user'.
 */
const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken); 

router.get('/', inventoryController.getInventory);

router.post('/simulate-rfid', inventoryController.simulateRfidScan);

module.exports = router;