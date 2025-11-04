const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth'); 

// Função auxiliar para buscar produto por RFID (DEVE existir na tabela 'produtos')
const getProductByRfidTag = async (connection, rfidTag) => {
    // Buscamos o ID, nome, e a quantidade mínima do produto associado a essa etiqueta
    const query = 'SELECT id_produto, nome FROM produtos WHERE etiqueta_rfid = ?';
    const [rows] = await connection.query(query, [rfidTag]);
    return rows.length > 0 ? rows[0] : null;
};

// =========================================================================
// Rota POST: Registrar Movimentação (Entrada/Saída/Devolução) com Validação RFID
// ENDPOINT: POST /api/movimentacoes
// =========================================================================
router.post('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    // Campos necessários: tipo, quantidade, unidade, justificativa, etiqueta_rfid
    const { 
        tipo, 
        quantidade, 
        unidade, 
        justificativa, 
        etiqueta_rfid,
    } = req.body;
    
    // O id_usuario é pego automaticamente do token de autenticação
    const id_usuario = req.user.id; 
    let id_produto_final = null;

    // --- 1. VALIDAÇÕES BÁSICAS E JUSTIFICATIVA DE DEVOLUÇÃO ---
    const tiposPermitidos = ['entrada', 'saida', 'devolucao'];
    
    if (!tipo || !tiposPermitidos.includes(tipo) || !etiqueta_rfid) {
        return res.status(400).json({ message: "Tipo de movimento (entrada, saida, devolucao) e Etiqueta RFID são obrigatórios." });
    }
    if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: "A 'quantidade' deve ser um valor positivo." });
    }

    // REGRA DE NEGÓCIO: Justificativa obrigatória para Devolução
    if (tipo === 'devolucao' && (!justificativa || justificativa.trim().length < 5)) {
        return res.status(400).json({ message: "A Justificativa é obrigatória para o tipo Devolução e deve ter no mínimo 5 caracteres." });
    }

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        // --- 2. BUSCA DO PRODUTO PELA ETIQUETA ---
        const produto = await getProductByRfidTag(connection, etiqueta_rfid);
        
        // REGRA DE NEGÓCIO PRINCIPAL: A etiqueta DEVE estar cadastrada para qualquer movimentação
        if (!produto) {
            await connection.rollback();
            return res.status(400).json({ 
                message: "ERRO: Etiqueta RFID não cadastrada. A movimentação requer uma etiqueta válida e vinculada a um produto." 
            });
        }
        
        // Define o produto final encontrado
        id_produto_final = produto.id_produto;
        let mensagemProduto = `Movimentação de ${tipo} registrada para o produto: ${produto.nome}.`;
        
        // Fator: 1 para Entrada e Devolução (aumenta estoque), -1 para Saída (diminui estoque)
        const fator = (tipo === 'saida' ? -1 : 1); 

        if (tipo === 'saida') {
            
            // Validação de Estoque (Impede saldo negativo)
            const [estoqueRows] = await connection.query(
                'SELECT quantidade_atual FROM estoque WHERE id_produto = ?',
                [id_produto_final]
            );

            if (estoqueRows.length === 0 || estoqueRows[0].quantidade_atual < quantidade) {
                 await connection.rollback();
                 return res.status(400).json({ 
                    message: "Estoque insuficiente para esta saída. Saldo atual: " + (estoqueRows[0]?.quantidade_atual || 0)
                 });
            }
        }
        
        // --- 3. REGISTRA A MOVIMENTAÇÃO (Tabela: movimentacoes) ---
        const data_movimentacao = new Date(); // Captura o timestamp atual do servidor
        
        const movQuery = `
            INSERT INTO movimentacoes (id_produto, id_usuario, tipo, quantidade, unidade, justificativa, data_movimentacao)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(movQuery, [
            id_produto_final,
            id_usuario, // Preenchido automaticamente pelo token
            tipo,
            quantidade,
            unidade,
            justificativa || null, 
            data_movimentacao // Preenchido automaticamente pelo servidor
        ]);

        // --- 4. ATUALIZA O ESTOQUE (Tabela: estoque) ---
        const estoqueQuery = `
            INSERT INTO estoque (id_produto, quantidade_atual) 
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE quantidade_atual = quantidade_atual + ?
        `;
        await connection.query(estoqueQuery, [
            id_produto_final,
            fator * quantidade,
            fator * quantidade 
        ]);

        await connection.commit();

        res.status(201).json({ 
            message: mensagemProduto
        });

    } catch (error) {
        await connection.rollback();
        console.error("Erro ao processar movimentação:", error);
        res.status(500).json({ message: "Erro interno do servidor ao registrar a movimentação." });
    } finally {
        connection.release();
    }
});


// =========================================================================
// Rota GET: Histórico de Movimentações (Para Relatórios)
// ENDPOINT: GET /api/movimentacoes/historico
// Filtros: ?tipo=entrada&id_produto=1&id_usuario=1
// =========================================================================
router.get('/historico', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { tipo, id_produto, id_usuario } = req.query;

    let query = `
        SELECT
            m.id_mov,
            m.tipo,
            m.quantidade,
            m.unidade,
            m.justificativa,
            m.data_movimentacao,
            p.nome AS nome_produto,
            u.nome AS nome_usuario,
            e.quantidade_atual AS estoque_apos_mov
        FROM movimentacoes m
        JOIN produtos p ON m.id_produto = p.id_produto
        JOIN usuarios u ON m.id_usuario = u.id_usuario
        LEFT JOIN estoque e ON m.id_produto = e.id_produto
    `;
    let conditions = [];
    let params = [];

    if (tipo) {
        conditions.push('m.tipo = ?');
        params.push(tipo);
    }
    if (id_produto) {
        conditions.push('m.id_produto = ?');
        params.push(id_produto);
    }
    if (id_usuario) {
        conditions.push('m.id_usuario = ?');
        params.push(id_usuario);
    }

    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY m.data_movimentacao DESC';

    try {
        const [rows] = await promisePool.query(query, params);
        res.status(200).json(rows);

    } catch (error) {
        console.error("Erro ao buscar histórico de movimentações:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar histórico." });
    }
});

module.exports = router;