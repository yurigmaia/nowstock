/**
 * @file dashboard.js
 * @description
 * Rota para buscar dados resumidos do dashboard.
 * Atualizado para incluir a lista das últimas 5 movimentações.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const { authenticateToken } = require('../middleware/auth');

router.get('/summary', authenticateToken, async (req, res) => {
    const id_empresa = req.user.empresa;

    try {
        const productsQuery = promisePool.query(
            `SELECT COUNT(id_produto) as totalProducts FROM produtos WHERE id_empresa = ?`,
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

        const recentQuery = promisePool.query(
            `SELECT m.id_mov, p.nome AS produto, u.nome AS usuario, m.tipo, m.quantidade, m.data_movimentacao
             FROM movimentacoes m
             JOIN produtos p ON m.id_produto = p.id_produto
             LEFT JOIN usuarios u ON m.id_usuario = u.id_usuario
             WHERE m.id_empresa = ?
             ORDER BY m.data_movimentacao DESC
             LIMIT 10`,
            [id_empresa]
        );

        const [
            [productsResult],
            [lowStockResult],
            [movementsResult],
            [recentResult]
        ] = await Promise.all([
            productsQuery,
            lowStockQuery,
            movementsQuery,
            recentQuery
        ]);

        const summary = {
            totalProducts: productsResult[0].totalProducts || 0,
            lowStockItems: lowStockResult[0].lowStockItems || 0,
            movementsToday: movementsResult[0].movementsToday || 0,
            recentMovements: recentResult || []
        };

        res.status(200).json(summary);

    } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

module.exports = router;