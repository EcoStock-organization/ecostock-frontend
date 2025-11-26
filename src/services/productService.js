import api from './api';

export const productService = {
  getAll: async () => {
    const response = await api.get('/produtos/');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/produtos/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/produtos/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.patch(`/produtos/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    await api.delete(`/produtos/${id}/`);
  },
  getCategorias: async () => {
    const response = await api.get('/produtos/categorias/');
    return response.data;
  }
};
