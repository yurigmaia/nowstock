const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const bcrypt = require('bcryptjs');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

// Rota para Administradores criarem novos usuários internos (Operadores/Visualizadores)
// ENDPOINT: POST /api/users
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { nome, email, senha, nivel_acesso } = req.body;
    
    // Pega o ID da empresa do ADMIN LOGADO através do token
    const id_empresa = req.user.empresa; 

    // Regras de negócio do seu sistema
    if (nivel_acesso === 'admin') {
        return res.status(400).json({ message: "Administradores não podem ser criados por esta rota interna. Use o Cadastro Inicial." });
    }
    const status_inicial = 'ativo'; 
    
    if (!nome || !email || !senha || !nivel_acesso) {
        return res.status(400).json({ message: "Nome, e-mail, senha e nível de acesso são obrigatórios." });
    }

    try {
        // ... (código para verificar e-mail, hashear senha e inserir no banco)
        const [existingUser] = await promisePool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const query = `
            INSERT INTO usuarios (id_empresa, nome, email, senha, nivel_acesso, status)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const [result] = await promisePool.query(query, [
            id_empresa, nome, email, hashedPassword, nivel_acesso, status_inicial
        ]);

        res.status(201).json({ 
            message: `Usuário '${nome}' cadastrado com sucesso! Status: ${status_inicial}.`, 
            userId: result.insertId 
        });

    } catch (error) {
        console.error("Erro ao cadastrar usuário (rota interna):", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

module.exports = router;