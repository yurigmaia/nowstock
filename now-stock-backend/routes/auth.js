const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); // Conexão com Promises
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

// ===================================
// Rota de CADASTRO INICIAL (Usuário + Empresa): POST /api/auth/register-initial
// Esta rota usa uma TRANSAÇÃO SQL para garantir que ambos sejam criados e vinculados.
// ===================================
router.post('/register-initial', async (req, res) => {
    const { 
        nome_usuario, 
        email, 
        senha, 
        nivel_acesso = 'admin', // Assume admin no cadastro inicial
        nome_empresa,
        cnpj
    } = req.body;

    if (!nome_usuario || !email || !senha || !nome_empresa || !cnpj) {
        return res.status(400).json({ message: "Todos os campos de usuário (Nome, Email, Senha) e empresa (Nome, CNPJ) são obrigatórios." });
    }

    let connection; // Variável para armazenar a conexão da transação

    try {
        // 1. Iniciar Transação
        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        // --- 1º PASSO: CADASTRO DO USUÁRIO ---
        // Verifica se o e-mail já existe
        const [existingUser] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        // HASHEAR a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // Insere o usuário com id_empresa NULO (temporariamente - por isso o ALTER TABLE é crucial)
        const [userResult] = await connection.query(
            `INSERT INTO usuarios (nome, email, senha, nivel_acesso, status, id_empresa) VALUES (?, ?, ?, ?, 'ativo', NULL)`, 
            [nome_usuario, email, hashedPassword, nivel_acesso]
        );
        const id_usuario = userResult.insertId;

        // --- 2º PASSO: CADASTRO DA EMPRESA ---
        
        // Insere a empresa usando o id_usuario como responsável
        const [companyResult] = await connection.query(
            `INSERT INTO empresas (nome, cnpj, id_usuario_responsavel) VALUES (?, ?, ?)`,
            [nome_empresa, cnpj, id_usuario]
        );
        const id_empresa = companyResult.insertId;

        // --- 3º PASSO: ATUALIZAR O USUÁRIO ---
        // Vincula o usuário Administrador à empresa que ele acabou de criar
        await connection.query(
            `UPDATE usuarios SET id_empresa = ? WHERE id_usuario = ?`, 
            [id_empresa, id_usuario]
        );

        // 4. Finalizar Transação (salvar as mudanças)
        await connection.commit();

        res.status(201).json({ 
            message: "Empresa e usuário administrador cadastrados com sucesso!", 
            userId: id_usuario,
            companyId: id_empresa
        });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Desfaz tudo em caso de erro
        }
        console.error("Erro na transação de cadastro inicial:", error);
        res.status(500).json({ message: "Erro interno do servidor durante o cadastro inicial." });
    } finally {
        if (connection) {
            connection.release(); // Libera a conexão para o pool
        }
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
        
        // 1b. Bloquear login se status for 'pendente' ou 'inativo'
        if (user.status !== 'ativo') {
             return res.status(403).json({ message: `Sua conta está com status: ${user.status}. Entre em contato com o administrador.` });
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
                nivel: user.nivel_acesso,
                id_empresa: user.id_empresa
            }
        });

    } catch (error) {
        console.error("Erro no processo de login:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

module.exports = router;