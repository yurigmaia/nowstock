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
import type { User, Product, Category, Supplier, UserStatus, Company } from "../types/entities";

const API_BASE_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

const handleResponse = async (response: Response) => {
  if (response.status === 204) {
    return;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.indexOf("application/json") !== -1) {
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || `Erro HTTP: ${response.status}`);
    }
    return result;
  } else {
    if (!response.ok) {
      throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
    }
    return response.text();
  }
};

export const apiService = {

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

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

  getProducts: async (): Promise<Product[]> => {
    const response = await fetch(`${API_BASE_URL}/produtos`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },
  
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  createMovement: async (data: any): Promise<void> => {
    const payload = {
      id_produto_manual: data.id_produto,
      tipo: data.movementType,
      quantidade: data.quantidade,
      unidade: data.unidade,
      justificativa: data.justificativa,
      estado: data.state,
      etiqueta_rfid: data.etiqueta_rfid,
    };
    const response = await fetch(`${API_BASE_URL}/movimentacoes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile: async (userId: number, data: any): Promise<User> => {
    const payload = {
      nome: data.nome,
      email: data.email,
    };
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getReport: async (reportType: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/reports/${reportType}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  simulateRfidScan: async (rfidTag: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/inventory/simulate-rfid`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ rfidTag })
    });
    return handleResponse(response);
  },

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
  getCompanyDetails: async (): Promise<Company> => {
    const response = await fetch(`${API_BASE_URL}/empresa/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateCompanyDetails: async (data: any): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/empresa/me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },
};