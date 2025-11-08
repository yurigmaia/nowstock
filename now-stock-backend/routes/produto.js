/**
 * @file produto.js
 * @description
 * Define as rotas (endpoints) para o CRUD (Criar, Ler, Atualizar, Deletar)
 * da entidade 'produtos'. Inclui middlewares de autenticação (authenticateToken)
 * e autorização (checkAdminOrOperator), e garante o isolamento de dados (multi-tenancy)
 * filtrando todas as consultas pelo 'id_empresa' do usuário logado.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth'); 

router.get('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const id_empresa = req.user.empresa;

    try {
        const query = `
            SELECT 
                p.id_produto, 
                p.nome, 
                p.descricao, 
                p.preco_custo, 
                p.preco_venda, 
                p.quantidade_minima, 
                p.etiqueta_rfid, 
                p.id_categoria, 
                c.nome AS nome_categoria, 
                p.id_fornecedor, 
                f.nome AS nome_fornecedor,
                COALESCE(e.quantidade_atual, 0) AS quantidade_atual,
                e.localizacao
            FROM produtos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN fornecedores f ON p.id_fornecedor = f.id_fornecedor
            LEFT JOIN estoque e ON p.id_produto = e.id_produto
            WHERE p.id_empresa = ?
            ORDER BY p.nome
        `;
        const [rows] = await promisePool.query(query, [id_empresa]);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar produtos." });
    }
});

router.post('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { 
        id_categoria, 
        id_fornecedor, 
        nome, 
        descricao, 
        preco_custo, 
        preco_venda, 
        quantidade_minima, 
        etiqueta_rfid 
    } = req.body;
    
    const id_usuario_cadastro = req.user.id; 
    const id_empresa = req.user.empresa;

    if (!nome || !etiqueta_rfid) {
        return res.status(400).json({ message: "Nome e Etiqueta RFID são campos obrigatórios." });
    }

    try {
        const [existingTag] = await promisePool.query(
            'SELECT id_produto FROM produtos WHERE etiqueta_rfid = ? AND id_empresa = ?', 
            [etiqueta_rfid, id_empresa]
        );
        if (existingTag.length > 0) {
            return res.status(409).json({ message: "Esta Etiqueta RFID (EPC) já está cadastrada em outro produto." });
        }
        
        const query = `
            INSERT INTO produtos (
                id_empresa, id_categoria, id_fornecedor, nome, descricao, preco_custo, 
                preco_venda, quantidade_minima, etiqueta_rfid
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await promisePool.query(query, [
            id_empresa,
            id_categoria || null, 
            id_fornecedor || null, 
            nome, 
            descricao || null,
            preco_custo || 0.00,
            preco_venda || 0.00,
            quantidade_minima || 0,
            etiqueta_rfid 
        ]);

        res.status(201).json({ 
            message: `Produto '${nome}' cadastrado com sucesso pelo usuário ID ${id_usuario_cadastro}.`, 
            produtoId: result.insertId 
        });

    } catch (error) {
        console.error("Erro ao cadastrar produto:", error);
        res.status(500).json({ message: "Erro interno do servidor ao cadastrar produto." });
    }
});

router.put('/:id', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { id } = req.params;
    const { 
        id_categoria, id_fornecedor, nome, descricao, preco_custo, 
        preco_venda, quantidade_minima, etiqueta_rfid
    } = req.body;
    const id_empresa = req.user.empresa;

    if (!nome || !etiqueta_rfid) {
        return res.status(400).json({ message: "Nome e Etiqueta RFID são obrigatórios para atualização." });
    }

    try {
        const [existingTag] = await promisePool.query(
            'SELECT id_produto FROM produtos WHERE etiqueta_rfid = ? AND id_produto != ? AND id_empresa = ?', 
            [etiqueta_rfid, id, id_empresa]
        );
        if (existingTag.length > 0) {
            return res.status(409).json({ message: "Outro produto já está usando esta Etiqueta RFID (EPC)." });
        }
        
        const query = `
            UPDATE produtos SET 
                id_categoria = ?, id_fornecedor = ?, nome = ?, descricao = ?, 
                preco_custo = ?, preco_venda = ?, quantidade_minima = ?, 
                etiqueta_rfid = ?
            WHERE id_produto = ? AND id_empresa = ?
        `;
        
        const [result] = await promisePool.query(query, [
            id_categoria || null, 
            id_fornecedor || null, 
            nome, 
            descricao || null,
            preco_custo || 0.00,
            preco_venda || 0.00,
            quantidade_minima || 0,
            etiqueta_rfid,
            id,
            id_empresa
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produto não encontrado para atualização." });
        }

        res.status(200).json({ 
            message: `Produto ID ${id} atualizado com sucesso.`,
            updated: true
        });

    } catch (error) {
        console.error("Erro ao atualizar produto:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar produto." });
    }
});

router.delete('/:id', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.empresa;

    try {
        const [result] = await promisePool.query(
            'DELETE FROM produtos WHERE id_produto = ? AND id_empresa = ?',
            [id, id_empresa]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Produto não encontrado para exclusão." });
        }

        res.status(200).json({
            message: `Produto ID ${id} excluído com sucesso.`,
            deleted: true
        });

    } catch (error) {
        console.error("Erro ao excluir produto:", error);
        res.status(500).json({ message: "Erro interno do servidor ao excluir produto." });
    }
});

module.exports = router;