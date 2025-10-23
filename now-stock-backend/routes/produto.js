// routes/produto.js (Revisado para aceitar Admin e Operador)

const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
// Importar o novo middleware
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth'); 

// Rota para Administradores E Operadores cadastrarem um novo produto
// ENDPOINT: POST /api/produtos
// Substituímos checkAdmin por checkAdminOrOperator
router.post('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { 
        id_categoria, 
        id_fornecedor, 
        nome, 
        descricao, 
        preco_custo, 
        preco_venda, 
        quantidade_minima, 
        etiqueta_rfid // Este é o EPC (Electronic Product Code)
    } = req.body;
    
    // O ID da empresa e o ID do usuário (quem cadastrou) vêm do token
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
        // Nota: Sua tabela 'produtos' não tem um campo para o ID do usuário que cadastrou.
        // Se você adicionar 'id_usuario_cadastro INT', poderá usar a variável acima.
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

module.exports = router;