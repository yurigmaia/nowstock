// now-stock-backend/db.js

const mysql = require('mysql2');
require('dotenv').config(); 

// Cria um pool de conexoes
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, // Usa DB_DATABASE do seu .env
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Converte o pool para Promise-based API para usarmos await/async nas rotas
const promisePool = pool.promise();

// Testa a conexão ao iniciar o servidor
promisePool.getConnection()
    .then(connection => {
        console.log("Conexão MySQL estabelecida com o banco:", process.env.DB_DATABASE);
        connection.release();
    })
    .catch(err => {
        console.error("ERRO: Falha ao conectar ao MySQL. Verifique suas credenciais.", err.message);
    });

// Exporta o pool com Promises
module.exports = promisePool;