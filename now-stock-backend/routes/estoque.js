const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth');

// =========================================================================
// Rota GET: Listar Estoque Atual
// ENDPOINT: GET /api/estoque
// =========================================================================
router.get('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    // Consulta SQL para listar todos os produtos e sua quantidade atual
    // Faz um LEFT JOIN com a tabela 'estoque' para incluir produtos que ainda não têm movimentação (saldo 0)
    const query = `
        SELECT
            p.id_produto,
            p.nome,
            p.descricao,
            p.preco_venda,
            p.quantidade_minima,
            p.etiqueta_rfid,
            c.nome AS nome_categoria,
            f.nome AS nome_fornecedor,
            COALESCE(e.quantidade_atual, 0) AS quantidade_atual, -- Se não houver registro, assume 0
            CASE 
                WHEN COALESCE(e.quantidade_atual, 0) <= p.quantidade_minima THEN TRUE
                ELSE FALSE
            END AS em_falta
        FROM produtos p
        JOIN categorias c ON p.id_categoria = c.id_categoria
        JOIN fornecedores f ON p.id_fornecedor = f.id_fornecedor
        LEFT JOIN estoque e ON p.id_produto = e.id_produto
        ORDER BY p.nome
    `;

    try {
        const [rows] = await promisePool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar o estoque atual:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar o estoque." });
    }
});

module.exports = router;
