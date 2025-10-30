const express = require('express');
const router = express.Router();
const promisePool = require('../config/db'); 
const bcrypt = require('bcryptjs');
const { authenticateToken, checkAdmin } = require('../middleware/auth');

// --- Rota para LISTAR todos os usuários da mesma empresa ---
// ENDPOINT: GET /api/users
// Restrita a Administradores
router.get('/', authenticateToken, checkAdmin, async (req, res) => {
    const id_empresa = req.user.empresa;

    try {
        // Seleciona todos os usuários, EXCETO o próprio Administrador que está fazendo a requisição
        const [rows] = await promisePool.query(
            `SELECT id_usuario, nome, email, nivel_acesso, status 
             FROM usuarios 
             WHERE id_empresa = ? AND id_usuario != ? 
             ORDER BY nome`,
            [id_empresa, req.user.id] // Exclui o próprio admin
        );
        res.status(200).json(rows);
    } catch (error) {
        console.error("Erro ao listar usuários:", error);
        res.status(500).json({ message: "Erro interno do servidor ao listar usuários." });
    }
});


// Rota para Administradores criarem novos usuários internos (Operadores/Visualizadores)
// ENDPOINT: POST /api/users
// Restrita a Administradores
router.post('/', authenticateToken, checkAdmin, async (req, res) => {
    const { nome, email, senha, nivel_acesso } = req.body;
    
    // Pega o ID da empresa do ADMIN LOGADO através do token
    const id_empresa = req.user.empresa; 

    // Regras de negócio do seu sistema: impede que esta rota crie admins
    if (nivel_acesso === 'admin') {
        return res.status(400).json({ message: "Administradores não podem ser criados por esta rota interna. Use o Cadastro Inicial." });
    }
    const status_inicial = 'ativo'; 
    
    if (!nome || !email || !senha || !nivel_acesso) {
        return res.status(400).json({ message: "Nome, e-mail, senha e nível de acesso são obrigatórios." });
    }

    try {
        // 1. Verificar se e-mail já existe
        const [existingUser] = await promisePool.query('SELECT id_usuario FROM usuarios WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        // 2. Hashear a senha
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);

        // 3. Inserir no banco
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


// --- Rota para ATUALIZAR um usuário interno ---
// ENDPOINT: PUT /api/users/:id
// Restrita a Administradores
router.put('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const { nome, email, nivel_acesso, status } = req.body;
    
    const id_empresa = req.user.empresa;

    // Regras de negócio
    if (id === req.user.id.toString()) {
        return res.status(403).json({ message: "Você não pode atualizar seu próprio perfil de usuário por esta rota." });
    }
    if (nivel_acesso === 'admin') {
        return res.status(400).json({ message: "O nível de acesso 'admin' não pode ser definido por esta rota." });
    }

    if (!nome || !email || !nivel_acesso || !status) {
        return res.status(400).json({ message: "Todos os campos de atualização são obrigatórios." });
    }
    
    try {
        // 1. Verificar se o usuário existe E pertence à mesma empresa
        const [userCheck] = await promisePool.query(
            'SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND id_empresa = ?',
            [id, id_empresa]
        );
        
        if (userCheck.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado ou não pertence à sua empresa." });
        }
        
        // 2. Verificar unicidade do e-mail (se o e-mail mudou)
        const [emailCheck] = await promisePool.query(
            'SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?',
            [email, id]
        );
        
        if (emailCheck.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está sendo usado por outro usuário." });
        }

        // 3. Atualizar
        const query = `
            UPDATE usuarios SET nome = ?, email = ?, nivel_acesso = ?, status = ?
            WHERE id_usuario = ? AND id_empresa = ?
        `;
        
        const [result] = await promisePool.query(query, [
            nome, email, nivel_acesso, status, id, id_empresa
        ]);

        res.status(200).json({ 
            message: `Usuário ID ${id} atualizado com sucesso.`,
            updated: true
        });

    } catch (error) {
        console.error("Erro ao atualizar usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao atualizar usuário." });
    }
});

// --- Rota para DELETAR um usuário interno ---
// ENDPOINT: DELETE /api/users/:id
// Restrita a Administradores
router.delete('/:id', authenticateToken, checkAdmin, async (req, res) => {
    const { id } = req.params;
    const id_empresa = req.user.empresa;

    // Impedir que o Admin tente deletar a si mesmo (risco de lockout)
    if (id === req.user.id.toString()) {
        return res.status(403).json({ message: "Você não pode deletar seu próprio perfil de usuário." });
    }
    
    try {
        // Deleta o usuário, verificando se ele pertence à empresa do admin logado
        const [result] = await promisePool.query(
            'DELETE FROM usuarios WHERE id_usuario = ? AND id_empresa = ?',
            [id, id_empresa]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Usuário não encontrado ou não pertence à sua empresa para exclusão." });
        }

        res.status(200).json({
            message: `Usuário ID ${id} excluído com sucesso.`,
            deleted: true
        });

    } catch (error) {
        console.error("Erro ao excluir usuário:", error);
        res.status(500).json({ message: "Erro interno do servidor ao excluir usuário." });
    }
});

module.exports = router;