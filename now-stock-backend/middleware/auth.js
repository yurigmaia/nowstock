const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware 1: Verifica se o token JWT é válido e anexa os dados do usuário à requisição
const authenticateToken = 
(req, res, next) =>
{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) {
        return res.status(401).json({message: 'Acesso negado. Token não fornecido.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({message: 'Token inválido ou expirado.' });
        }
        // Dados do usuário logado (id, nivel, empresa) são salvos em req.user
        req.user = user; 
        next();
    });
};

// Middleware 2: Verifica se o usuário é Administrador
const checkAdmin = 
(req, res, next) =>
{
    if (req.user.nivel !== 'admin')
    {
        return res.status(403).json({message: 'Acesso negado. Requer nível de Administrador.' });
    }
    next();
};

// =========================================================
// NOVO MIDDLEWARE: Verifica se o usuário é Admin OU Operador
// =========================================================
const checkAdminOrOperator = 
(req, res, next) => 
{
    const nivel = req.user.nivel;
    if (nivel !== 'admin' && nivel !== 'operador') {
        return res.status(403).json({ message: 'Acesso negado. Requer nível de Administrador ou Operador.' });
    }
    next();
};

module.exports = {
    authenticateToken,
    checkAdmin,
    checkAdminOrOperator 
};