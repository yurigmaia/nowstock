const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth'); 

// --- Rota para LISTAR todos os produtos ---
// ENDPOINT: GET /api/produtos
// Permite Administradores e Operadores
router.get('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    try {
        // Seleciona todos os campos do produto e os nomes da categoria e fornecedor (JOIN)
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
                f.nome AS nome_fornecedor
            FROM produtos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            LEFT JOIN fornecedores f ON p.id_fornecedor = f.id_fornecedor
            ORDER BY p.nome
        `;
        const [rows] = await promisePool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar produtos:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar produtos." });
    }
});


// --- Rota para CADASTRAR um novo produto (POST) ---
// ENDPOINT: POST /api/produtos
// Permite Administradores e Operadores
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
    
    // O ID do usuário que cadastrou vem do token (req.user.id)
    const id_usuario_cadastro = req.user.id; 

    // Validação básica dos campos obrigatórios
    if (!nome || !etiqueta_rfid) {
        return res.status(400).json({ message: "Nome e Etiqueta RFID são campos obrigatórios." });
    }

    try {
        // 1. Verificar se a Etiqueta RFID já existe (garantindo a UNICIDADE)
        const [existingTag] = await promisePool.query(
            'SELECT id_produto FROM produtos WHERE etiqueta_rfid = ?', 
            [etiqueta_rfid]
        );
        if (existingTag.length > 0) {
            return res.status(409).json({ message: "Esta Etiqueta RFID (EPC) já está cadastrada em outro produto." });
        }
        
        // 2. Inserir o novo produto na tabela
        const query = `
            INSERT INTO produtos (
                id_categoria, id_fornecedor, nome, descricao, preco_custo, 
                preco_venda, quantidade_minima, etiqueta_rfid
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await promisePool.query(query, [
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


// --- Rota para ATUALIZAR um produto ---
// ENDPOINT: PUT /api/produtos/:id
// Permite Administradores e Operadores
router.put('/:id', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { id } = req.params;
    const { 
        id_categoria, id_fornecedor, nome, descricao, preco_custo, 
        preco_venda, quantidade_minima, etiqueta_rfid
    } = req.body;

    // Validação básica
    if (!nome || !etiqueta_rfid) {
        return res.status(400).json({ message: "Nome e Etiqueta RFID são obrigatórios para atualização." });
    }

    try {
        // 1. Verificar unicidade da etiqueta RFID, excluindo o produto atual
        const [existingTag] = await promisePool.query(
            'SELECT id_produto FROM produtos WHERE etiqueta_rfid = ? AND id_produto != ?', 
            [etiqueta_rfid, id]
        );
        if (existingTag.length > 0) {
            return res.status(409).json({ message: "Outro produto já está usando esta Etiqueta RFID (EPC)." });
        }
        
        // 2. Atualizar o produto
        const query = `
            UPDATE produtos SET 
                id_categoria = ?, id_fornecedor = ?, nome = ?, descricao = ?, 
                preco_custo = ?, preco_venda = ?, quantidade_minima = ?, 
                etiqueta_rfid = ?
            WHERE id_produto = ?
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
            id
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


// --- Rota para EXCLUIR um produto ---
// ENDPOINT: DELETE /api/produtos/:id
// Permite Administradores e Operadores
router.delete('/:id', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { id } = req.params;

    try {
        // Nota: É importante que qualquer entrada em outras tabelas (como estoque/movimentação)
        // que faça referência a este produto seja tratada (ex: configurada para CASCADE DELETE 
        // no MySQL ou tratada aqui) para manter a integridade.

        const [result] = await promisePool.query(
            'DELETE FROM produtos WHERE id_produto = ?',
            [id]
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