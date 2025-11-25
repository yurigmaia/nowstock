const express = require('express');
require('dotenv').config(); 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user'); 
const produtoRoutes = require('./routes/produto');
const categoriaRoutes = require('./routes/categoria');
const fornecedorRoutes = require('./routes/fornecedor');
const dashboardRoutes = require('./routes/dashboard');
const movimentacaoRoutes = require('./routes/movimentacao'); 
const estoqueRoutes = require('./routes/estoque');        
const empresaRoutes = require('./routes/empresa');
const inventoryRoutes = require('./routes/inventoryRoutes');
const cors = require('cors'); 
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); 

app.use(express.json()); 

app.use('/api/auth', authRoutes); 

app.use('/api/users', userRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/movimentacoes', movimentacaoRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/empresa', empresaRoutes);
app.use('/api/inventory', inventoryRoutes);

app.get('/', (req, res) => {
    res.send("API do NowStock (Leitor RFID) está online e Express rodando!");
});

app.listen(PORT, () => {
    console.log(`Servidor Express rodando em http://localhost:${PORT}`);
});

require('./config/db');
