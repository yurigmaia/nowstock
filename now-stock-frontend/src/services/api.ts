import type { DashboardSummary } from "../types/dashboard";

const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const apiService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    console.log("Mocking API call for getDashboardSummary...");

    const mockSummaryData: DashboardSummary = {
      totalProducts: 125,
      lowStockItems: 18,
      movementsToday: 42,
    };

    await new Promise(resolve => setTimeout(resolve, 1000));
    return Promise.resolve(mockSummaryData);

    /*
    // --- codigo real, comentado para que o front possa ser desenvolvido sem o back por enquanto ---
    const response = await fetch(`${API_BASE_URL}/dashboard/summary`, {
      headers: getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard summary');
    }
    return response.json();
    */
  }
};