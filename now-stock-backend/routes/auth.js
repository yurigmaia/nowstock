const express = require('express');
const router = express.Router();
const promisePool = require('../db'); // <--- AGORA SE CHAMA 'promisePool'
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

// ===================================
// Rota de CADASTRO: POST /api/auth/register
// ===================================
router.post('/register', async (req, res) => {
    const { 
        id_empresa, nome, email, senha, nivel_acesso 
    } = req.body;

    if (!nome || !email || !senha || !nivel_acesso || !id_empresa) {
        return res.status(400).json({ message: "Todos os campos são obrigatórios." });
    }

    try {
        // 1. Verificar se o e-mail já existe
        const [existingUser] = await promisePool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        // 2. HASHEAR a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // 3. Inserir o novo usuário no MySQL
        const query = `
            INSERT INTO usuarios (id_empresa, nome, email, senha, nivel_acesso)
            VALUES (?, ?, ?, ?, ?)
        `;
        
        const [result] = await promisePool.query(query, [
            id_empresa, nome, email, hashedPassword, nivel_acesso
        ]);

        res.status(201).json({ 
            message: "Usuário cadastrado com sucesso!", 
            userId: result.insertId 
        });

    } catch (error) {
        if (error.errno === 1452) {
             return res.status(400).json({ message: "Empresa não encontrada. Verifique o id_empresa." });
        }
        console.error("Erro ao cadastrar usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});


// ===================================
// Rota de LOGIN: POST /api/auth/login
// ===================================
router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    try {
        // 1. Busca o usuário pelo email
        const [rows] = await promisePool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // 2. Compara a senha (bcrypt)
        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        
        // 3. Gera Token JWT
        const token = jwt.sign(
            { id: user.id_usuario, nivel: user.nivel_acesso, empresa: user.id_empresa },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } 
        );
        
        res.json({ 
            message: "Login bem-sucedido!",
            token,
            user: {
                id: user.id_usuario,
                nome: user.nome,
                nivel: user.nivel_acesso
            }
        });

    } catch (error) {
        console.error("Erro no processo de login:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

module.exports = router;