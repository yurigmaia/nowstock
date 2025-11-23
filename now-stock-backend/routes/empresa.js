/**
 * @file empresa.js
 * @description
 * Rotas para visualizar e editar os dados da própria empresa logada.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

router.get('/me', authenticateToken, checkAdmin, async (req, res) => {
    const id_empresa = req.user.empresa;

    try {
        const [rows] = await promisePool.query(
            'SELECT nome, cnpj, data_cadastro FROM empresas WHERE id_empresa = ?',
            [id_empresa]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ message: "Empresa não encontrada." });
        }

        res.status(200).json(rows[0]);
    } catch (error) {
        console.error("Erro ao buscar dados da empresa:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

router.put('/me', authenticateToken, checkAdmin, async (req, res) => {
    const id_empresa = req.user.empresa;
    const { nome, cnpj } = req.body;

    if (!nome || !cnpj) {
        return res.status(400).json({ message: "Nome e CNPJ são obrigatórios." });
    }

    try {
        const [existing] = await promisePool.query(
            'SELECT id_empresa FROM empresas WHERE cnpj = ? AND id_empresa != ?',
            [cnpj, id_empresa]
        );

        if (existing.length > 0) {
            return res.status(409).json({ message: "Este CNPJ já está em uso por outra empresa." });
        }

        await promisePool.query(
            'UPDATE empresas SET nome = ?, cnpj = ? WHERE id_empresa = ?',
            [nome, cnpj, id_empresa]
        );

        res.status(200).json({ message: "Dados da empresa atualizados com sucesso." });

    } catch (error) {
        console.error("Erro ao atualizar empresa:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

module.exports = router;