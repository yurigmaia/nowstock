/**
 * @file api.ts
 * @description
 * Serviço central de API para comunicação com o backend.
 * Todas as chamadas fetch para a API do Node.js são encapsuladas aqui.
 * Este serviço é responsável por:
 * 1. Anexar o token de autenticação (JWT) nas requisições.
 * 2. Converter dados do frontend (camelCase) para o backend (snake_case) quando necessário.
 * 3. Lidar com as respostas da API e retornar dados tipados.
 */

import type { DashboardSummary } from "../types/dashboard";
import type { User, Product, Category, Supplier, UserStatus } from "../types/entities";

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Lida com respostas de erro da API de forma padronizada.
 */
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.message || `Erro HTTP: ${response.status}`);
  }
  // Para DELETE, a resposta pode vir vazia (204 No Content)
  if (response.status === 204) {
    return;
  }
  return response.json();
};

// =======================================================================
// --- Objeto de Serviço da API (100% REAL) ---
// =======================================================================

export const apiService = {

  // --- DASHBOARD ---
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- USUÁRIOS (Users) ---
  getUsers: async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  updateUserStatus: async (userId: number, status: UserStatus): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createUser: async (userData: any): Promise<User> => {
    const payload = {
      nome: userData.name,
      email: userData.email,
      senha: userData.password,
      nivel_acesso: userData.level
    };
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  // --- PRODUTOS (Products) ---
  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/produtos`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
  // --- CATEGORIAS (Categories) ---
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createCategory: async (data: any): Promise<Category> => {
    const payload = {
      nome: data.nome,
      descricao: data.descricao
    };
    const response = await fetch(`${API_BASE_URL}/categorias`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCategory: async (id: number, data: any): Promise<Category> => {
    const payload = {
      nome: data.nome,
      descricao: data.descricao
    };
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  deleteCategory: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- FORNECEDORES (Suppliers) ---
  getSuppliers: async (): Promise<Supplier[]> => {
    const response = await fetch(`${API_BASE_URL}/fornecedores`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createSupplier: async (data: any): Promise<Supplier> => {
    const payload = {
      nome: data.nome,
      cnpj: data.cnpj,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
    };
    const response = await fetch(`${API_BASE_URL}/fornecedores`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateSupplier: async (id: number, data: any): Promise<Supplier> => {
    const payload = {
      nome: data.nome,
      cnpj: data.cnpj,
      telefone: data.telefone,
      email: data.email,
      endereco: data.endereco,
    };
    const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  deleteSupplier: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/fornecedores/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- MOVIMENTAÇÕES DE ESTOQUE ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createMovement: async (data: any): Promise<void> => {
    const payload = {
      id_produto: data.id_produto,
      tipo: data.movementType,
      quantidade: data.quantidade,
      unidade: data.unidade,
      justificativa: data.justificativa,
      estado: data.state,
      etiqueta_rfid: data.etiqueta_rfid,
      id_usuario: data.id_usuario,
    };
    const response = await fetch(`${API_BASE_URL}/stock/adjust`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  // --- PERFIL DO USUÁRIO ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: async (userId: number, data: any): Promise<User> => {
    const payload = {
      nome: data.nome,
      email: data.email,
    };
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  deleteAccount: async (userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- RELATÓRIOS ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getReport: async (reportType: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportType}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // --- RFID ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateRfidScan: async (rfidTag: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/inventory/simulate-rfid`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rfidTag })
    });
    return handleResponse(response);
  },

  // --- PREFERÊNCIAS (Tema/Idioma) ---
  getAvailableLanguages: async (): Promise<{ value: string, label: string }[]> => {
    const response = await fetch(`${API_BASE_URL}/languages`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateUserPreferences: async (userId: number, preferences: any): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/preferences`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(preferences)
    });
    return handleResponse(response);
  },
};