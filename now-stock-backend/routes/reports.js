/**
 * @file reports.js
 * @description
 * Rotas para gerar os relatórios do sistema (Estoque, Baixo Estoque, Movimentações).
 * Todas as consultas são filtradas pelo 'id_empresa' para garantir isolamento de dados.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth');

router.use(authenticateToken, checkAdminOrOperator);

router.get('/:type', async (req, res) => {
    const { type } = req.params;
    const id_empresa = req.user.empresa;

    try {
        let query = '';
        let params = [id_empresa];

        switch (type) {
            case 'current-stock':
                query = `
                    SELECT 
                        p.id_produto,
                        p.nome,
                        COALESCE(e.quantidade_atual, 0) as quantidade_atual,
                        p.quantidade_minima
                    FROM produtos p
                    LEFT JOIN estoque e ON p.id_produto = e.id_produto
                    WHERE p.id_empresa = ?
                    ORDER BY p.nome
                `;
                break;

            case 'low-stock':
                query = `
                    SELECT 
                        p.id_produto,
                        p.nome,
                        COALESCE(e.quantidade_atual, 0) as quantidade_atual,
                        p.quantidade_minima
                    FROM produtos p
                    LEFT JOIN estoque e ON p.id_produto = e.id_produto
                    WHERE p.id_empresa = ? 
                    AND COALESCE(e.quantidade_atual, 0) <= p.quantidade_minima
                    ORDER BY p.nome
                `;
                break;

            case 'most-moved':
                query = `
                    SELECT 
                        p.nome as nome_produto,
                        COUNT(m.id_mov) as total_movimentacoes,
                        'Geral' as periodo
                    FROM movimentacoes m
                    JOIN produtos p ON m.id_produto = p.id_produto
                    WHERE m.id_empresa = ?
                    GROUP BY p.id_produto, p.nome
                    ORDER BY total_movimentacoes DESC
                    LIMIT 10
                `;
                break;

            case 'history':
                query = `
                    SELECT 
                        m.id_mov,
                        p.nome as nome_produto,
                        m.tipo,
                        m.quantidade,
                        m.data_movimentacao
                    FROM movimentacoes m
                    JOIN produtos p ON m.id_produto = p.id_produto
                    WHERE m.id_empresa = ?
                    ORDER BY m.data_movimentacao DESC
                    LIMIT 50
                `;
                break;

            default:
                return res.status(400).json({ message: "Tipo de relatório inválido." });
        }

        const [rows] = await promisePool.query(query, params);
        res.json(rows);

    } catch (error) {
        console.error(`Erro no relatório ${type}:`, error);
        res.status(500).json({ message: "Erro ao gerar relatório." });
    }
});

module.exports = router;