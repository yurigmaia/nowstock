const express = require('express');
require('dotenv').config(); 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); 
const produtoRoutes = require('./routes/produto');
const categoriaRoutes = require('./routes/categoria');
const fornecedorRoutes = require('./routes/fornecedor');
const movimentacaoRoutes = require('./routes/movimentacao'); 
const estoqueRoutes = require('./routes/estoque');        
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para CORS (essencial para o front-end)
app.use(cors()); 

// Middleware essencial: permite ao Express ler o corpo de requisições JSON
app.use(express.json()); 

// === ROTAS ===
// Rotas Abertas: Cadastro Inicial e Login
app.use('/api/auth', authRoutes); 

// Rotas Protegidas: Gestão de Usuários (necessita de token e admin)
app.use('/api/users', userRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes); // Adicionado
app.use('/api/estoque', estoqueRoutes);          // Adicionado

// Rota de teste
app.get('/', (req, res) => {
    res.send("API do NowStock (Leitor RFID) está online e Express rodando!");
});

// Inicia o servidor Express
app.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

// Garante que a conexão com o MySQL é testada e iniciada
require('./config/db');
