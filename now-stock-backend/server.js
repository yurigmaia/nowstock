const express = require('express');
require('dotenv').config(); 
const authRoutes = require('./routes/auth');
const cors = require('cors'); //Importação do CORS

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para CORS (essencial para o front-end)
app.use(cors()); 

// Middleware essencial: permite ao Express ler o corpo de requisições JSON
app.use(express.json()); 

// === ROTAS ===
// Monta as rotas de autenticação (cadastro e login)
app.use('/api/auth', authRoutes); 

// Rota de teste
app.get('/', (req, res) => {
    res.send("API do Leitor RFID está online e Express rodando!");
});

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// Garante que a conexão com o MySQL é testada e iniciada
require('./db');