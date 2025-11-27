export interface RecentMovement {
  id_mov: number;
  produto: string;
  usuario: string;
  tipo: 'entrada' | 'saida' | 'ajuste' | 'devolucao';
  quantidade: number;
  data_movimentacao: string;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockItems: number;
  movementsToday: number;
  recentMovements: RecentMovement[];
}