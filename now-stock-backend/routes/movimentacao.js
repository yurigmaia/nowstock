/**
 * @file movimentacao.js
 * @description
 * Define as rotas (endpoints) para o registro e consulta de movimentações de estoque.
 * Inclui a rota principal (POST /) para registrar entradas, saídas, devoluções e ajustes,
 * utilizando uma transação SQL para garantir a integridade dos dados.
 * Também inclui uma rota (GET /historico) para consultar o histórico de movimentações.
 * Todas as rotas são protegidas e filtradas por 'id_empresa'.
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const { authenticateToken, checkAdminOrOperator } = require('../middleware/auth'); 

const getProductByRfidTag = async (connection, rfidTag, id_empresa) => {
    const query = 'SELECT id_produto, nome FROM produtos WHERE etiqueta_rfid = ? AND id_empresa = ?';
    const [rows] = await connection.query(query, [rfidTag, id_empresa]);
    return rows.length > 0 ? rows[0] : null;
};

router.post('/', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { 
        tipo, 
        quantidade, 
        unidade, 
        justificativa, 
        etiqueta_rfid,
        id_produto_manual
    } = req.body;
    
    const id_usuario = req.user.id; 
    const id_empresa = req.user.empresa;
    let id_produto_final = id_produto_manual || null;
    let produto_nome_final = "Produto Manual";

    const tiposPermitidos = ['entrada', 'saida', 'devolucao', 'ajuste'];
    
    if (!tipo || !tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ message: "Tipo de movimento inválido." });
    }
    if (tipo !== 'ajuste' && !etiqueta_rfid && !id_produto_manual) {
        return res.status(400).json({ message: "Etiqueta RFID ou ID do Produto manual é obrigatório." });
    }
    if (tipo === 'ajuste' && !id_produto_manual) {
         return res.status(400).json({ message: "ID do Produto é obrigatório para Ajuste Manual." });
    }
    if (!quantidade || quantidade <= 0) {
        return res.status(400).json({ message: "A 'quantidade' deve ser um valor positivo." });
    }
    if ((tipo === 'devolucao' || tipo === 'ajuste') && (!justificativa || justificativa.trim().length < 5)) {
        return res.status(400).json({ message: "A Justificativa é obrigatória para Devolução ou Ajuste e deve ter no mínimo 5 caracteres." });
    }

    const connection = await promisePool.getConnection();
    await connection.beginTransaction();

    try {
        if (etiqueta_rfid) {
            const produto = await getProductByRfidTag(connection, etiqueta_rfid, id_empresa);
            
            if (!produto) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: "ERRO: Etiqueta RFID não cadastrada para esta empresa." 
                });
            }
            
            id_produto_final = produto.id_produto;
            produto_nome_final = produto.nome;
        }
        if (!id_produto_final) {
             await connection.rollback();
             return res.status(400).json({ message: "Não foi possível identificar o produto para a movimentação." });
        }

        let mensagemProduto = `Movimentação de ${tipo} registrada para o produto ID: ${id_produto_final}.`;
        
        const fator = (tipo === 'saida' ? -1 : 1); 

        if (tipo === 'saida') {
            const [estoqueRows] = await connection.query(
                'SELECT quantidade_atual FROM estoque WHERE id_produto = ? AND id_empresa = ?',
                [id_produto_final, id_empresa]
            );

            if (estoqueRows.length === 0 || estoqueRows[0].quantidade_atual < quantidade) {
                 await connection.rollback();
                 return res.status(400).json({ 
                    message: "Estoque insuficiente para esta saída. Saldo atual: " + (estoqueRows[0]?.quantidade_atual || 0)
                 });
            }
        }
        
        const data_movimentacao = new Date(); 
        
        const movQuery = `
            INSERT INTO movimentacoes (id_empresa, id_produto, id_usuario, tipo, quantidade, unidade, justificativa, data_movimentacao)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await connection.query(movQuery, [
            id_empresa,
            id_produto_final,
            id_usuario, 
            tipo,
            quantidade,
            unidade || 'unidade',
            justificativa || null, 
            data_movimentacao
        ]);

        const estoqueQuery = `
            INSERT INTO estoque (id_empresa, id_produto, quantidade_atual) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE quantidade_atual = quantidade_atual + ?
        `;
        await connection.query(estoqueQuery, [
            id_empresa,
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

router.get('/historico', authenticateToken, checkAdminOrOperator, async (req, res) => {
    const { tipo, id_produto, id_usuario } = req.query;
    const id_empresa = req.user.empresa;

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
    
    let conditions = ['m.id_empresa = ?'];
    let params = [id_empresa];

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