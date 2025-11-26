import api from './api';

export const stockService = {
  getByBranch: async (branchId) => {
    const response = await api.get(`/filiais/${branchId}/estoque/`);
    return response.data;
  },
  add: async (branchId, data) => {
    const response = await api.post(`/filiais/${branchId}/estoque/`, data);
    return response.data;
  },
  update: async (branchId, itemId, data) => {
    const response = await api.patch(`/filiais/${branchId}/estoque/${itemId}/`, data);
    return response.data;
  },
  delete: async (branchId, itemId) => {
    await api.delete(`/filiais/${branchId}/estoque/${itemId}/`);
  }
};
