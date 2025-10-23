// controllers/inventoryController.js (Revisado)

const InventoryModel = require('../models/inventoryModel');
// Configurações do Scanner (ID do usuário, pois a leitura RFID não tem login de usuário)
const { ID_USUARIO_LEITOR } = require('../config/rfidScanner'); // Assumimos que o Scanner exporta o ID do operador

// Rota de API para listar o inventário (usada pelo Front-end)
exports.getInventory = async (req, res) => {
    try {
        const id_empresa = req.user.empresa; 
        // Esta função deve ser implementada no Model para buscar (Produtos + Estoque)
        // Por exemplo: JOIN produtos p ON p.id_empresa = id_empresa LEFT JOIN estoque e ON e.id_produto = p.id_produto
        // Aqui, vou retornar apenas a lista de Produtos por simplicidade.
        // const inventory = await InventoryModel.findAllProducts(id_empresa);
        // res.json(inventory);

        // Retornando uma mensagem para o front-end saber que esta rota precisa ser implementada
        res.status(501).json({ message: "Rota GET /api/inventory em construção. Implementar JOIN entre 'produtos' e 'estoque'." });

    } catch (error) {
        console.error("Erro ao buscar inventário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao buscar inventário." });
    }
};

// ===============================================
// LÓGICA PRINCIPAL: Processamento da leitura RFID
// ===============================================
exports.handleRfidScan = async (rfidTag, idUsuario) => {
    try {
        const product = await InventoryModel.findProductByRfid(rfidTag);
        
        if (!product) {
            // ITEM NÃO CADASTRADO: Pede ao Front-end para cadastrar o produto (PUT/POST)
            console.log(`[RFID] Tag ${rfidTag} não encontrada na tabela 'produtos'. Requer cadastro.`);
            return { 
                rfidTag, 
                action: 'ERROR', 
                message: "Produto não cadastrado para esta etiqueta RFID." 
            };
        }
        
        // 1. Verificar o último status/quantidade (A forma mais precisa é olhar o estoque atual)
        const currentStock = await InventoryModel.getCurrentStock(product.id_produto);
        
        // 2. Determinar a Ação: 
        // Se a quantidade atual for 0, o próximo movimento DEVE ser 'entrada'.
        // Se a quantidade for > 0, o próximo movimento DEVE ser 'saida'.
        const tipoMovimento = currentStock === 0 ? 'entrada' : 'saida';

        // 3. Processar Movimentação (Transacional)
        const result = await InventoryModel.processRfidMovement(
            product.id_produto, 
            idUsuario, // ID do Scanner ou do Operador Logado
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

// Rota de Simulação (Chamando o handleRfidScan)
exports.simulateRfidScan = async (req, res) => {
    // Você pode usar o id_usuario do token para simulação, ou um ID fixo.
    const idUsuario = req.user.id; 
    const { rfidTag } = req.body;
    
    if (!rfidTag) {
        return res.status(400).json({ message: "rfidTag é obrigatório para simulação." });
    }
    
    try {
        // Assume que a empresa no token é a empresa do produto (para futura validação de segurança)
        const result = await exports.handleRfidScan(rfidTag, idUsuario); 
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Erro interno do servidor durante a simulação de leitura." });
    }
};