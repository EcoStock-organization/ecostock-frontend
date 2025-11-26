import api from './api';

export const branchService = {
  getAll: async () => {
    const response = await api.get('/filiais/');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/filiais/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/filiais/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/filiais/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/filiais/${id}/`);
  }
};
