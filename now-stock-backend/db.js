// now-stock-backend/db.js

const mysql = require('mysql2');
// Carrega as variaveis do arquivo .env
require('dotenv').config(); 

// Cria um pool de conexoes. É melhor do que criar e fechar conexoes
// para cada requisicao, pois reutiliza recursos.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10, // Limita o numero maximo de conexoes ativas
    queueLimit: 0
});

// Converte o pool para Promise-based API.
// Isso permite usar 'await' nas consultas SQL, deixando o codigo mais limpo.
const promisePool = pool.promise();

// Exporta para que o 'server.js' possa usar a conexao
module.exports = promisePool;