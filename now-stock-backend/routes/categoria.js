const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdmin } = require('../middleware/auth');

// --- Rota para LISTAR todas as categorias ---
// ENDPOINT: GET /api/categorias
// Permite que qualquer usuário autenticado acesse
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id_categoria, nome, descricao FROM categorias ORDER BY nome'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar categorias." });
    }
});

// --- Rota para CADASTRAR uma nova categoria ---
// ENDPOINT: POST /api/categorias
// Apenas Administradores podem criar categorias (checkAdmin)
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { nome, descricao } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório." });
    }

    try {
        // 1. Verificar unicidade do nome (recomendado)
        const [existingCategory] = await promisePool.query(
            'SELECT id_categoria FROM categorias WHERE nome = ?',
            [nome]
        );
        if (existingCategory.length > 0) {
            return res.status(409).json({ message: "Uma categoria com este nome já existe." });
        }
        
        // 2. Inserir a nova categoria
        const query = `
            INSERT INTO categorias (nome, descricao)
            VALUES (?, ?)
        `;
        const [result] = await promisePool.query(query, [
            nome,
            descricao || null 
        ]);

        res.status(201).json({
            message: `Categoria '${nome}' cadastrada com sucesso.`, 
            categoriaId: result.insertId 
        });

    } catch (error) {
        console.error("Erro ao cadastrar categoria:", error);
        res.status(500).json({ message: "Erro interno do servidor ao cadastrar categoria." });
    }
});

// --- Rota para ATUALIZAR uma categoria ---
// ENDPOINT: PUT /api/categorias/:id
// Apenas Administradores podem atualizar categorias (checkAdmin)
router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;

    if (!nome) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório para atualização."});
    }

    try {
        // 1. Atualizar a categoria
        const query = `
            UPDATE categorias SET nome = ?, descricao = ? WHERE id_categoria = ?
        `;
        const [result] = await promisePool.query(query, [
            nome,
            descricao || null,
            id
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Categoria não encontrada para atualização." });
        }

        res.status(200).json({
            message: `Categoria ID ${id} atualizada com sucesso.`,
            updated: true
        });

    } catch (error) {
        console.error("Erro ao atualizar categoria:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar categoria." });
    }
});

module.exports = router;