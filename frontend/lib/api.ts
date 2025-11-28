import axios from 'axios';
import Cookies from 'js-cookie';

// 👉 AUTH API: Apenas login/refresh
export const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL, 
});

// 👉 CORE API: Tudo do backend principal (filial, usuário, estoque...)
export const coreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CORE_API_URL,
});

// 👉 Interceptor para anexar automaticamente o token no CORE
coreApi.interceptors.request.use(
  (config) => {
    const token = Cookies.get('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("Nenhum token encontrado nos cookies.");
    }
    return config;
  },
  (error) => Promise.reject(error)
);
