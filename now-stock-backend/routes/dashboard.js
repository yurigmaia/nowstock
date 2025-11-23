/**
 * @file dashboard.js
 * @description
 * Define a rota (endpoint) para buscar os dados resumidos do dashboard.
 * Esta rota é protegida e retorna um agregado de informações (contagens)
 * específicas da empresa do usuário logado (multi-tenancy).
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/summary', authenticateToken, async (req, res) => {
    const id_empresa = req.user.empresa;

    try {
        const productsQuery = promisePool.query(
            `SELECT COUNT(id_produto) as totalProducts 
             FROM produtos 
             WHERE id_empresa = ?`,
            [id_empresa]
        );

        const lowStockQuery = promisePool.query(
            `SELECT COUNT(p.id_produto) as lowStockItems 
             FROM produtos p
             JOIN estoque e ON p.id_produto = e.id_produto
             WHERE p.id_empresa = ? AND e.quantidade_atual < p.quantidade_minima`,
            [id_empresa]
        );

        const movementsQuery = promisePool.query(
            `SELECT COUNT(id_mov) as movementsToday 
             FROM movimentacoes 
             WHERE id_empresa = ? AND DATE(data_movimentacao) = CURDATE()`,
            [id_empresa]
        );

        const [
            [productsResult],
            [lowStockResult],
            [movementsResult]
        ] = await Promise.all([
            productsQuery,
            lowStockQuery,
            movementsQuery
        ]);

        const summary = {
            totalProducts: productsResult[0].totalProducts || 0,
            lowStockItems: lowStockResult[0].lowStockItems || 0,
            movementsToday: movementsResult[0].movementsToday || 0
        };

        res.status(200).json(summary);

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar dados do dashboard." });
    }
});

module.exports = router;