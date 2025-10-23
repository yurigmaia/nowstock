const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdmin } = require('../middleware/auth');

// --- Rota para LISTAR todos os fornecedores ---
// ENDPOINT: GET /api/fornecedores
// Permite que qualquer usuário autenticado acesse
router.get('/', authenticateToken, async (req, res) => {
    try {
        const [rows] = await promisePool.query(
            'SELECT id_fornecedor, nome, cnpj, email, telefone FROM fornecedores ORDER BY nome'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar fornecedores:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar fornecedores." });
    }
});

// --- Rota para CADASTRAR um novo fornecedor ---
// ENDPOINT: POST /api/fornecedores
// Apenas Administradores podem criar fornecedores (checkAdmin)
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { nome, cnpj, email, telefone } = req.body;

    if (!nome || !cnpj) {
        return res.status(400).json({ message: "Nome e CNPJ do fornecedor são obrigatórios." });
    }

    try {
        // 1. Verificar unicidade do CNPJ
        const [existingCnpj] = await promisePool.query(
            'SELECT id_fornecedor FROM fornecedores WHERE cnpj = ?',
            [cnpj]
        );
        if (existingCnpj.length > 0) {
            return res.status(409).json({ message: "Um fornecedor com este CNPJ já está cadastrado." });
        }
        
        // 2. Inserir o novo fornecedor
        const query = `
            INSERT INTO fornecedores (nome, cnpj, email, telefone)
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await promisePool.query(query, [
            nome,
            cnpj,
            email || null,
            telefone || null
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

// --- Rota para ATUALIZAR um fornecedor ---
// ENDPOINT: PUT /api/fornecedores/:id
// Apenas Administradores podem atualizar fornecedores (checkAdmin)
router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, cnpj, email, telefone } = req.body;

    if (!nome || !cnpj) {
        return res.status(400).json({ message: "Nome e CNPJ do fornecedor são obrigatórios para atualização."});
    }

    try {
        // 1. Verificar unicidade do CNPJ (excluindo o fornecedor atual)
        const [existingCnpj] = await promisePool.query(
            'SELECT id_fornecedor FROM fornecedores WHERE cnpj = ? AND id_fornecedor != ?',
            [cnpj, id]
        );
        if (existingCnpj.length > 0) {
            return res.status(409).json({ message: "Outro fornecedor com este CNPJ já está cadastrado." });
        }

        // 2. Atualizar o fornecedor
        const query = `
            UPDATE fornecedores SET nome = ?, cnpj = ?, email = ?, telefone = ? WHERE id_fornecedor = ?
        `;
        const [result] = await promisePool.query(query, [
            nome,
            cnpj,
            email || null,
            telefone || null,
            id
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

module.exports = router;