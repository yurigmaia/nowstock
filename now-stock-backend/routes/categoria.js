/**
 * @file categoria.js
 * @description
 * Define as rotas (endpoints) para o CRUD (Criar, Ler, Atualizar, Deletar)
 * da entidade 'categorias'. Inclui middlewares de autenticação (authenticateToken)
 * e autorização (checkAdmin), e garante o isolamento de dados (multi-tenancy)
 * filtrando todas as consultas pelo 'id_empresa' do usuário logado.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    const id_empresa = req.user.empresa;

    try {
        const [rows] = await promisePool.query(
            'SELECT id_categoria, nome, descricao FROM categorias WHERE id_empresa = ? ORDER BY nome',
            [id_empresa]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar categorias:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar categorias." });
    }
});

router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { nome, descricao } = req.body;
    const id_empresa = req.user.empresa;

    if (!nome) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório." });
    }

    try {
        const [existingCategory] = await promisePool.query(
            'SELECT id_categoria FROM categorias WHERE nome = ? AND id_empresa = ?',
            [nome, id_empresa]
        );
        if (existingCategory.length > 0) {
            return res.status(409).json({ message: "Uma categoria com este nome já existe." });
        }
        
        const query = `
            INSERT INTO categorias (id_empresa, nome, descricao)
            VALUES (?, ?, ?)
        `;
        const [result] = await promisePool.query(query, [
            id_empresa,
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

router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const id_empresa = req.user.empresa;

    if (!nome) {
        return res.status(400).json({ message: "O nome da categoria é obrigatório para atualização."});
    }

    try {
        const query = `
            UPDATE categorias SET nome = ?, descricao = ? WHERE id_categoria = ? AND id_empresa = ?
        `;
        const [result] = await promisePool.query(query, [
            nome,
            descricao || null,
            id,
            id_empresa
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

router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.empresa;

    try {
        const [result] = await promisePool.query(
            'DELETE FROM categorias WHERE id_categoria = ? AND id_empresa = ?',
            [id, id_empresa]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Categoria não encontrada para exclusão." });
        }

        res.status(200).json({
            message: `Categoria ID ${id} excluída com sucesso.`,
            deleted: true
        });

    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        res.status(500).json({ message: "Erro interno do servidor ao excluir categoria. Verifique se não há produtos vinculados." });
    }
});

module.exports = router;