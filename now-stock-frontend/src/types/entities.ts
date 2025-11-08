/**
 * @file entities.ts
 * @description
 * Define as interfaces TypeScript (os "tipos") para as principais entidades
 * do sistema. Os nomes das propriedades (em snake_case) correspondem 1:1
 * ao que o backend (Node.js) deve retornar, baseado no script SQL.
 */

export type UserRole = 'admin' | 'operador' | 'visualizador';
export type UserStatus = 'ativo' | 'inativo' | 'pendente';
export type MovementType = 'entrada' | 'saida' | 'ajuste';
export type MovementUnit = 'unidade' | 'lote';
export type ReturnState = 'estoque' | 'descarte';
export type ReaderType = 'USB' | 'WiFi' | 'Bluetooth';
export type BackupInterval = 'diario' | 'semanal' | 'mensal';
export type AppColorScheme = 'light' | 'dark';

/**
 * Tabela: empresas
 * Guarda as informações de cada empresa que usa o sistema.
 */
export interface Company {
  id_empresa: number;
  nome: string;
  cnpj: string | null;
  data_cadastro: string;
  id_usuario_responsavel: number | null;
}

/**
 * Tabela: usuarios
 * Guarda os usuários, que sempre pertencem a uma empresa.
 */
export interface User {
  id_usuario: number;
  id_empresa: number;
  nome: string;
  email: string;
  nivel_acesso: UserRole;
  data_cadastro: string;
  status: UserStatus;
  tema: AppColorScheme; // <-- ADICIONADO
  idioma: string; // <-- ADICIONADO (ex: 'pt', 'en')
}

/**
 * Tabela: fornecedores
 * Armazena os fornecedores.
 */
export interface Supplier {
  id_fornecedor: number;
  id_empresa: number;
  nome: string;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  data_cadastro: string;
}

/**
 * Tabela: categorias
 * Armazena as categorias de produtos.
 */
export interface Category {
  id_categoria: number;
  id_empresa: number;
  nome: string;
  descricao: string | null;
}

/**
 * Tabela: produtos
 * O catálogo de produtos de cada empresa.
 */
export interface Product {
  id_produto: number;
  id_empresa: number;
  id_categoria: number | null;
  id_fornecedor: number | null;
  nome: string;
  descricao: string | null;
  preco_custo: number | null;
  preco_venda: number | null;
  quantidade_minima: number;
  etiqueta_rfid: string | null;
  data_cadastro: string;
}

/**
 * Tabela: estoque
 * Armazena a quantidade atual e localização dos produtos.
 */
export interface Stock {
  id_estoque: number;
  id_empresa: number;
  id_produto: number;
  quantidade_atual: number;
  localizacao: string | null;
}

/**
 * Tabela: movimentacoes
 * Registra toda e qualquer movimentação de estoque.
 */
export interface StockMovement {
  id_mov: number;
  id_empresa: number;
  id_produto: number;
  id_usuario: number | null;
  tipo: MovementType;
  quantidade: number;
  justificativa: string | null;
  unidade: MovementUnit;
  data_movimentacao: string;
}

/**
 * Tabela: devolucoes
 * Cabeçalho de uma devolução.
 */
export interface ReturnHeader {
  id_devolucao: number;
  id_empresa: number;
  id_usuario: number;
  motivo: string | null;
  estado: ReturnState;
  data_devolucao: string;
}

/**
 * Tabela: devolucao_itens
 * Itens de uma devolução.
 */
export interface ReturnItem {
  id_item: number;
  id_empresa: number;
  id_devolucao: number;
  id_produto: number;
  etiqueta_rfid: string | null;
  quantidade: number;
}

/**
 * Tabela: logs_sistema
 * Registra ações importantes no sistema.
 */
export interface SystemLog {
  id_log: number;
  id_empresa: number;
  id_usuario: number | null;
  acao: string;
  data_log: string;
}

/**
 * Tabela: configuracoes
 * Configurações por empresa (usa id_empresa como PK).
 */
export interface Configuration {
  id_empresa: number;
  tipo_leitor: ReaderType;
  porta_usb: string | null;
  ip_leitor: string | null;
  potencia_sinal: number;
  intervalo_leitura: number;
  email_alerta: string | null;
  intervalo_backup: BackupInterval;
}