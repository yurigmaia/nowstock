/**
 * @file estoque.js
 * @description
 * Define as rotas (endpoints) para a consulta da entidade 'estoque'.
 * A rota principal (GET /) retorna uma lista consolidada dos produtos
 * da empresa, suas quantidades atuais (da tabela 'estoque') e
 * dados associados (de 'categorias' e 'fornecedores').
 * Todas as rotas são protegidas e filtradas por 'id_empresa'.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth');

router.get('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const id_empresa = req.user.empresa;

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
            COALESCE(e.quantidade_atual, 0) AS quantidade_atual,
            CASE 
                WHEN COALESCE(e.quantidade_atual, 0) <= p.quantidade_minima THEN TRUE
                ELSE FALSE
            END AS em_falta
        FROM produtos p
        JOIN categorias c ON p.id_categoria = c.id_categoria
        JOIN fornecedores f ON p.id_fornecedor = f.id_fornecedor
        LEFT JOIN estoque e ON p.id_produto = e.id_produto
        WHERE p.id_empresa = ?
        ORDER BY p.nome
    `;

    try {
        const [rows] = await promisePool.query(query, [id_empresa]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar o estoque atual:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar o estoque." });
    }
});

module.exports = router;