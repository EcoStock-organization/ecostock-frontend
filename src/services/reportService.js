import api from './api';

export const reportService = {
  getDashboard: async () => {
    const response = await api.get('/relatorios/dashboard/');
    return response.data;
  },
  getLowStock: async () => {
    const response = await api.get('/relatorios/estoque-baixo/');
    return response.data;
  }
};
