/**
 * @file authService.ts
 * @description
 * Serviço dedicado para lidar com todas as chamadas de API relacionadas
 * à autenticação, incluindo login, registro e logout.
 */
export interface LoginPayload {
  email: string;
  senha: string;
}

export interface UserResponse {
  id: number;
  nome: string;
  email: string;
  nivel: 'admin' | 'operador';
  id_empresa: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserResponse;
}

export interface UserRegisterPayload {
  cnpj_empresa: string;
  nome_usuario: string;
  email: string;
  senha: string;
}

export interface RegisterInitialPayload {
  nome_usuario: string;
  email: string;
  senha: string;
  nome_empresa: string;
  cnpj: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const handleResponse = async (response: Response) => {
  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || 'Ocorreu um erro no servidor.');
  }
  return result;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerInitial = async (data: RegisterInitialPayload): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/auth/register-initial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Erro no registerInitial:", error instanceof Error ? error.message : error);
    throw error;
  }
};

export const login = async (email: string, senha: string): Promise<AuthResponse> => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, senha } as LoginPayload),
    });

    const result: AuthResponse = await handleResponse(response);
    
    localStorage.setItem('token', result.token);
    localStorage.setItem('user', JSON.stringify(result.user));

    return result;
  } catch (error) {
    console.error("Erro na conexão ou no processamento do login:", error instanceof Error ? error.message : error);
    throw error;
  }
};

export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const registerUser = async (data: UserRegisterPayload): Promise<any> => {
  try {
    const response = await fetch(`${API_URL}/auth/register-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  } catch (error) {
    console.error("Erro no registerUser:", error instanceof Error ? error.message : error);
    throw error;
  }
};