/**
 * @file fornecedor.js
 * @description
 * Define as rotas (endpoints) para o CRUD (Criar, Ler, Atualizar, Deletar)
 * da entidade 'fornecedores'. Inclui middlewares de autenticação (authenticateToken)
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
            'SELECT id_fornecedor, nome, cnpj, email, telefone, endereco FROM fornecedores WHERE id_empresa = ? ORDER BY nome',
            [id_empresa]
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar fornecedores:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar fornecedores." });
    }
});

router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { nome, cnpj, email, telefone, endereco } = req.body;
    const id_empresa = req.user.empresa;

    if (!nome || !cnpj) {
        return res.status(400).json({ message: "Nome e CNPJ do fornecedor são obrigatórios." });
    }

    try {
        const [existingCnpj] = await promisePool.query(
            'SELECT id_fornecedor FROM fornecedores WHERE cnpj = ? AND id_empresa = ?',
            [cnpj, id_empresa]
        );
        if (existingCnpj.length > 0) {
            return res.status(409).json({ message: "Um fornecedor com este CNPJ já está cadastrado." });
        }
        
        const query = `
            INSERT INTO fornecedores (id_empresa, nome, cnpj, email, telefone, endereco)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const [result] = await promisePool.query(query, [
            id_empresa,
            nome,
            cnpj,
            email || null,
            telefone || null,
            endereco || null
        ]);

        res.status(201).json({
            message: `Fornecedor '${nome}' cadastrado com sucesso.`, 
            fornecedorId: result.insertId 
        });

    } catch (error) {
        console.error("Erro ao cadastrar fornecedor:", error);
        res.status(500).json({ message: "Erro interno do servidor ao cadastrar fornecedor." });
    }
});

router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, cnpj, email, telefone, endereco } = req.body;
    const id_empresa = req.user.empresa;

    if (!nome || !cnpj) {
        return res.status(400).json({ message: "Nome e CNPJ do fornecedor são obrigatórios para atualização."});
    }

    try {
        const [existingCnpj] = await promisePool.query(
            'SELECT id_fornecedor FROM fornecedores WHERE cnpj = ? AND id_fornecedor != ? AND id_empresa = ?',
            [cnpj, id, id_empresa]
        );
        if (existingCnpj.length > 0) {
            return res.status(409).json({ message: "Outro fornecedor com este CNPJ já está cadastrado." });
        }

        const query = `
            UPDATE fornecedores SET nome = ?, cnpj = ?, email = ?, telefone = ?, endereco = ? 
            WHERE id_fornecedor = ? AND id_empresa = ?
        `;
        const [result] = await promisePool.query(query, [
            nome,
            cnpj,
            email || null,
            telefone || null,
            endereco || null,
            id,
            id_empresa
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Fornecedor não encontrado para atualização." });
        }

        res.status(200).json({
            message: `Fornecedor ID ${id} atualizado com sucesso.`,
            updated: true
        });

    } catch (error) {
        console.error("Erro ao atualizar fornecedor:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar fornecedor." });
    }
});

router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.empresa;

    try {
        const [result] = await promisePool.query(
            'DELETE FROM fornecedores WHERE id_fornecedor = ? AND id_empresa = ?',
            [id, id_empresa]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Fornecedor não encontrado para exclusão." });
        }

        res.status(200).json({
            message: `Fornecedor ID ${id} excluído com sucesso.`,
            deleted: true
        });

    } catch (error) {
        console.error("Erro ao excluir fornecedor:", error);
        res.status(500).json({ message: "Erro interno do servidor ao excluir fornecedor. Verifique se não há produtos vinculados." });
    }
});

module.exports = router;