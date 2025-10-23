// models/inventoryModel.js (Revisado)

const promisePool = require('../config/db');

class InventoryModel {
    /**
     * Busca um produto pelo código RFID.
     * @param {string} rfidTag - O código da tag RFID.
     * @returns {object|null} O produto encontrado ou null.
     */
    static async findProductByRfid(rfidTag) {
        const query = 'SELECT * FROM produtos WHERE etiqueta_rfid = ?';
        const [rows] = await promisePool.query(query, [rfidTag]);
        return rows[0];
    }
    
    /**
     * Busca a quantidade atual em estoque para um produto.
     */
    static async getCurrentStock(idProduto) {
        const query = 'SELECT quantidade_atual FROM estoque WHERE id_produto = ?';
        const [rows] = await promisePool.query(query, [idProduto]);
        return rows[0] ? rows[0].quantidade_atual : 0;
    }

    /**
     * Registra a movimentação e atualiza o estoque (TRANSACIONAL).
     * @param {number} idProduto - ID do produto.
     * @param {number} idUsuario - ID do usuário logado/scanner (para auditoria).
     * @param {string} tipo - 'entrada' ou 'saida'.
     */
    static async processRfidMovement(idProduto, idUsuario, tipo) {
        let connection;
        try {
            connection = await promisePool.getConnection();
            await connection.beginTransaction();

            const quantidade = 1; // Leitura RFID = 1 unidade
            
            // 1. REGISTRAR MOVIMENTAÇÃO
            const movQuery = `
                INSERT INTO movimentacoes 
                (id_produto, id_usuario, tipo, quantidade, justificativa) 
                VALUES (?, ?, ?, ?, ?)
            `;
            await connection.query(movQuery, [
                idProduto, 
                idUsuario, 
                tipo, 
                quantidade, 
                `Leitura RFID - ${tipo.toUpperCase()}`
            ]);

            // 2. ATUALIZAR ESTOQUE
            const estoqueQuery = `
                INSERT INTO estoque (id_produto, quantidade_atual)
                VALUES (?, ?)
                ON DUPLICATE KEY UPDATE 
                    quantidade_atual = quantidade_atual + ?
            `;
            // Se for entrada, soma 1. Se for saída, subtrai 1 (usamos o tipo como multiplicador)
            const change = tipo === 'entrada' ? quantidade : -quantidade;

            // Nota: Você pode precisar de uma UNIQUE KEY em (id_produto) na tabela 'estoque'
            // para que o ON DUPLICATE KEY UPDATE funcione corretamente no INSERT.
            await connection.query(estoqueQuery, [idProduto, change, change]);
            
            // 3. Registrar Log de Leitura (Opcional, mas útil)
            // A tabela 'leituras_rfid' pode ser usada como log de auditoria de scanners.
            const logQuery = `
                INSERT INTO leituras_rfid (etiqueta_rfid, id_usuario, acao)
                SELECT etiqueta_rfid, ?, ? FROM produtos WHERE id_produto = ?
            `;
            await connection.query(logQuery, [idUsuario, tipo, idProduto]);


            await connection.commit();
            return { success: true, newStatus: tipo };

        } catch (error) {
            if (connection) {
                await connection.rollback();
            }
            throw error;
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }
}

module.exports = InventoryModel;