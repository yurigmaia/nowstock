// src/services/authService.js

// Acessa a variável de ambiente definida no .env.local
const API_URL = import.meta.env.VITE_API_URL;

// --- 1. Cadastro Inicial (Empresa + Admin) ---
export const registerInitial = async (data) => {
    try {
        const response = await fetch(`${API_URL}/auth/register-initial`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
            // Lança o erro com a mensagem retornada pelo backend
            throw new Error(result.message || 'Falha no cadastro inicial.');
        }

        return result; // Contém message, userId, e companyId
    } catch (error) {
        console.error("Erro no registerInitial:", error.message);
        throw error;
    }
};

// --- 2. Login de Usuário ---
export const login = async (email, senha) => {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        const result = await response.json();

        if (!response.ok) {
            // Lança o erro com a mensagem do backend
            throw new Error(result.message || 'E-mail ou senha inválidos.');
        }
        
        // Salvar o token e os dados do usuário no LocalStorage
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        return result.user; // Retorna os dados do usuário
    } catch (error) {
        // Erro de rede ou outro problema, não o erro HTTP do backend
        console.error("Erro na conexão ou no processamento do login:", error.message);
        throw error;
    }
};

// --- 3. Logout ---
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Em uma aplicação real, você também forçaria o redirecionamento aqui.
};

