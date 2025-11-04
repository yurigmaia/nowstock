/**
 * @file entities.ts
 * @description
 * Define as interfaces TypeScript (os "tipos") para as principais entidades
 * do sistema. Os nomes das propriedades aqui (em snake_case) são
 * projetados para corresponder 1:1 ao JSON retornado pela API do backend.
 */
export type UserRole = 'admin' | 'operador' | 'visualizador';
export type UserStatus = 'ativo' | 'inativo' | 'pendente';
export type MovementType = 'entrada' | 'saida' | 'ajuste';
export type MovementUnit = 'unidade' | 'lote';

export interface User {
  id_usuario: number;
  id_empresa: number;
  nome: string;
  email: string;
  nivel_acesso: UserRole;
  data_cadastro: string;
  status: UserStatus;
}

export interface Supplier {
  id_fornecedor: number;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  data_cadastro: string;
}

export interface Category {
  id_categoria: number;
  nome: string;
  descricao: string | null;
}

export interface Product {
  id_produto: number;
  id_categoria: number | null;
  id_fornecedor: number | null;
  nome: string;
  descricao: string | null;
  preco_custo: number | null;
  preco_venda: number | null;
  quantidade_minima: number | null;
  etiqueta_rfid: string | null;
  data_cadastro: string;
  quantidade_atual: number;
  localizacao: string | null;
}