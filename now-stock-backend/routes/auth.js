/**
 * @file auth.js
 * @description
 * Define as rotas de autenticação públicas do sistema.
 * - /register-initial: Cria Empresa + Usuário Admin (Transação).
 * - /login: Autentica e retorna o objeto User compatível com o frontend.
 * - /register-user: Solicitação de cadastro em empresa existente (Status Pendente).
 */
const express = require('express');
const router = express.Router();
const promisePool = require('../config/db');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 

router.post('/register-initial', async (req, res) => {
    const { 
        nome_usuario, 
        email, 
        senha, 
        nome_empresa,
        cnpj
    } = req.body;

    if (!nome_usuario || !email || !senha || !nome_empresa || !cnpj) {
        return res.status(400).json({ message: "Todos os campos de usuário e empresa são obrigatórios." });
    }

    let connection;

    try {
        connection = await promisePool.getConnection();
        await connection.beginTransaction();

        const [existingUser] = await connection.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        const [companyResult] = await connection.query(
            `INSERT INTO empresas (nome, cnpj, data_cadastro) VALUES (?, ?, NOW())`,
            [nome_empresa, cnpj]
        );
        const id_empresa = companyResult.insertId;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const [userResult] = await connection.query(
            `INSERT INTO usuarios (id_empresa, nome, email, senha, nivel_acesso, status, data_cadastro) 
             VALUES (?, ?, ?, ?, 'admin', 'ativo', NOW())`, 
            [id_empresa, nome_usuario, email, hashedPassword]
        );
        const id_usuario = userResult.insertId;

        await connection.query(
            `UPDATE empresas SET id_usuario_responsavel = ? WHERE id_empresa = ?`, 
            [id_usuario, id_empresa]
        );

        await connection.commit();

        res.status(201).json({ 
            message: "Empresa e usuário administrador cadastrados com sucesso!", 
            userId: id_usuario,
            companyId: id_empresa
        });

    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Erro na transação de cadastro inicial:", error);
        res.status(500).json({ message: "Erro interno do servidor durante o cadastro inicial." });
    } finally {
        if (connection) connection.release();
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios." });
    }

    try {
        const [rows] = await promisePool.query(
            `SELECT u.*, e.nome as nome_empresa 
             FROM usuarios u 
             JOIN empresas e ON u.id_empresa = e.id_empresa 
             WHERE u.email = ?`, 
            [email]
        );
        
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        
        if (user.status !== 'ativo') {
             return res.status(403).json({ message: `Sua conta está com status: ${user.status}. Entre em contato com o administrador.` });
        }

        const isMatch = await bcrypt.compare(senha, user.senha);

        if (!isMatch) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }
        
        const token = jwt.sign(
            { 
                id: user.id_usuario, 
                nivel: user.nivel_acesso,
                empresa: user.id_empresa 
            },
            process.env.JWT_SECRET || 'fallback_secret',
            { expiresIn: '8h' } 
        );
        
        res.json({ 
            message: "Login bem-sucedido!",
            token,
            user: {
                id: user.id_usuario,
                id_usuario: user.id_usuario,
                id_empresa: user.id_empresa,
                nome: user.nome,
                email: user.email,
                nivel_acesso: user.nivel_acesso,
                status: user.status,
                data_cadastro: user.data_cadastro,
                tema: user.tema || 'dark',
                idioma: user.idioma || 'pt',
                nome_empresa: user.nome_empresa 
            }
        });

    } catch (error) {
        console.error("Erro no processo de login:", error);
        res.status(500).json({ message: "Erro interno do servidor." });
    }
});

router.post('/register-user', async (req, res) => {
    const { 
        nome_usuario, 
        email, 
        senha, 
        cnpj_empresa
    } = req.body;

    if (!nome_usuario || !email || !senha || !cnpj_empresa) {
        return res.status(400).json({ message: "Todos os campos (Nome, Email, Senha, CNPJ) são obrigatórios." });
    }

    try {
        const cleanCnpj = cnpj_empresa.replace(/\D/g, '');
        const [companyRows] = await promisePool.query('SELECT id_empresa FROM empresas WHERE cnpj = ?', [cleanCnpj]);
        const company = companyRows[0];

        if (!company) {
            return res.status(404).json({ message: "Nenhuma empresa encontrada com este CNPJ." });
        }
        const id_empresa = company.id_empresa;

        const [existingUser] = await promisePool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        const query = `
            INSERT INTO usuarios (id_empresa, nome, email, senha, nivel_acesso, status, data_cadastro)
            VALUES (?, ?, ?, ?, 'operador', 'pendente', NOW())
        `;
        
        await promisePool.query(query, [
            id_empresa, nome_usuario, email, hashedPassword
        ]);

        res.status(201).json({ 
            message: "Solicitação enviada! Aguarde a aprovação do administrador da empresa."
        });

    } catch (error) {
        console.error("Erro no cadastro de usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor durante a solicitação de cadastro." });
    }
});

module.exports = router;