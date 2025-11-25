/**
 * @file inventoryController.js
 * @description
 * Controlador responsável pela lógica de negócio do inventário.
 * Gerencia a leitura de tags RFID, decisão de entrada/saída e
 * comunicação com o Model para persistência.
 */
const InventoryModel = require('../models/inventoryModel');

// Rota de API para listar o inventário
exports.getInventory = async (req, res) => {
    try {
        const id_empresa = req.user.empresa; 
        // TODO: Implementar no Model a busca com JOIN (Produtos + Estoque) filtrando por id_empresa
        res.status(501).json({ message: "Rota GET /api/inventory em construção." });

    } catch (error) {
        console.error("Erro ao buscar inventário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar inventário." });
    }
};

/**
 * Lógica central de processamento do RFID.
 * Pode ser chamada via API (simulação) ou futuramente por MQTT/Socket.
 */
exports.handleRfidScan = async (rfidTag, idUsuario, idEmpresa) => {
    try {
        // 1. Busca o produto (Filtrando pela empresa para garantir segurança)
        const product = await InventoryModel.findProductByRfid(rfidTag, idEmpresa);
        
        if (!product) {
            console.log(`[RFID] Tag ${rfidTag} não encontrada para a empresa ${idEmpresa}.`);
            return { 
                rfidTag, 
                action: 'ERROR', 
                message: "Produto não cadastrado para esta etiqueta RFID nesta empresa." 
            };
        }
        
        // 2. Verificar o saldo atual
        const currentStock = await InventoryModel.getCurrentStock(product.id_produto, idEmpresa);
        
        // 3. Determinar a Ação (Regra de Negócio: Saldo 0 = Entrada, Saldo > 0 = Saída)
        const tipoMovimento = currentStock === 0 ? 'entrada' : 'saida';

        // 4. Processar Movimentação (Transacional)
        await InventoryModel.processRfidMovement(
            product.id_produto, 
            idUsuario, 
            idEmpresa, // Passamos a empresa para registrar no log correto
            tipoMovimento
        );

        const newStock = tipoMovimento === 'entrada' ? currentStock + 1 : currentStock - 1;

        return { 
            rfidTag, 
            productName: product.nome, 
            action: tipoMovimento, 
            newStock: newStock,
            message: `Movimentação de ${tipoMovimento.toUpperCase()} registrada para ${product.nome}. Estoque: ${newStock}`
        };

    } catch (error) {
        console.error(`Erro ao processar leitura RFID ${rfidTag}:`, error);
        return { 
            rfidTag, 
            action: 'FATAL_ERROR', 
            message: `Erro interno do servidor: ${error.message}` 
        };
    }
};

// Rota de Simulação (Endpoint chamado pelo Frontend ou Hardware via HTTP)
exports.simulateRfidScan = async (req, res) => {
    const idUsuario = req.user.id; 
    const idEmpresa = req.user.empresa; // Importante: Pega a empresa do token
    const { rfidTag } = req.body;
    
    if (!rfidTag) {
        return res.status(400).json({ message: "rfidTag é obrigatório para simulação." });
    }
    
    try {
        // Chama a lógica de negócio passando os dados do contexto (Usuário e Empresa)
        const result = await exports.handleRfidScan(rfidTag, idUsuario, idEmpresa); 
        
        // Retorna o resultado (seja sucesso ou erro de "produto não encontrado")
        // Se foi um erro fatal de servidor, o status muda, senão é 200 com a mensagem de erro lógica
        if (result.action === 'FATAL_ERROR') {
            return res.status(500).json(result);
        }
        
        res.json(result);

    } catch (error) {
        res.status(500).json({ message: "Erro interno do servidor durante a simulação de leitura." });
    }
};