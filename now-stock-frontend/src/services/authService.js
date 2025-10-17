
const API_URL = import.meta.env.VITE_API_URL;

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
            throw new Error(result.message || 'Falha no cadastro inicial.');
        }

        return result;
    } catch (error) {
        console.error("Erro no registerInitial:", error.message);
        throw error;
    }
};

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
            throw new Error(result.message || 'E-mail ou senha inválidos.');
        }
        
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));

        return result.user;
    } catch (error) {
        console.error("Erro na conexão ou no processamento do login:", error.message);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

