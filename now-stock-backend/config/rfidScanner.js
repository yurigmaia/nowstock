// config/rfidScanner.js (Revisado)

const { SerialPort } = require('@serialport/stream');
const { ReadlineParser } = require('@serialport/parser-readline');
const inventoryController = require('../controllers/inventoryController');

// =========================================================================
// CONFIGURAÇÃO CRÍTICA
// =========================================================================
const PORT_PATH = 'COM3'; // Exemplo: 'COM3' (Windows) ou '/dev/ttyUSB0' (Linux/Mac)
const BAUD_RATE = 9600; // Verifique a documentação do seu leitor
const ID_USUARIO_LEITOR = 1; // <--- ID de um usuário "Scanner" ou "Sistema" no seu DB

// =========================================================================

const port = new SerialPort({ 
    path: PORT_PATH, 
    baudRate: BAUD_RATE,
    autoOpen: false 
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

function startMonitoring() {
    port.open((err) => {
        if (err) {
            return console.error(`[RFID] ERRO ao abrir a porta serial ${PORT_PATH}:`, err.message);
        }
        console.log(`[RFID] Porta serial ${PORT_PATH} aberta. Usuário Operador: ${ID_USUARIO_LEITOR}.`);
    });

    parser.on('data', async (data) => {
        const rfidTag = data.toString().trim();
        if (rfidTag.length > 0) {
            console.log(`[RFID SCANNER] Código Lido: ${rfidTag}`);
            
            // Chama a função do Controller com o ID do usuário/scanner fixo
            const result = await inventoryController.handleRfidScan(
                rfidTag, 
                ID_USUARIO_LEITOR // Usa o ID fixo para registrar a Movimentação
            );

            console.log(`[RFID RESULTADO] ${result.message}`);
            // NOTA: Se precisar notificar o Front-end, use WebSockets (Socket.io) aqui.
        }
    });

    port.on('error', (err) => {
        console.error(`[RFID] Erro na comunicação: ${err.message}`);
    });
}

// Opcional: Lista as portas disponíveis para ajudar na configuração inicial
SerialPort.list().then(ports => {
    console.log('[RFID] Portas seriais disponíveis:', ports.map(p => p.path).join(', '));
}).catch(err => {
    console.warn("[RFID] Aviso: Não foi possível listar portas seriais. Instale as dependências corretas (serialport).", err.message);
});


module.exports = {
    startMonitoring,
    ID_USUARIO_LEITOR // Exporta para o Controller, se necessário
};