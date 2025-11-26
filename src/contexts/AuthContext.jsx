import { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from "jwt-decode";
import api from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          api.defaults.headers.Authorization = `Bearer ${token}`;
          setUser({ id: decoded.user_id }); 
        }
      } catch (error) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      // Aponta para o serviço de Auth na porta 8001
      const response = await fetch('http://localhost:8001/api/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        const { access, refresh } = data;
        localStorage.setItem('accessToken', access);
        localStorage.setItem('refreshToken', refresh);
        api.defaults.headers.Authorization = `Bearer ${access}`;
        const decoded = jwtDecode(access);
        setUser({ id: decoded.user_id });
        return true;
      } else {
        throw new Error(data.detail || 'Falha no login');
      }
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    delete api.defaults.headers.Authorization;
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
