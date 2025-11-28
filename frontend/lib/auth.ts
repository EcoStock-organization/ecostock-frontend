import { authApi, coreApi } from './api';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { User } from "@/lib/types";

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<User>
  logout: () => void
}

export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<User> {
    try {
      // 1. Obter Token
      const { data } = await authApi.post('/token/', { 
        username: email, 
        password 
      });
      
      Cookies.set('access_token', data.access);
      Cookies.set('refresh_token', data.refresh);

      // 2. Decodificar ID
      const decoded: { user_id: number } = jwtDecode(data.access);
      
      // 3. Buscar Perfil no Backend
      const response = await coreApi.get(`/usuarios/?usuario_id_auth=${decoded.user_id}`);
      const userProfile = response.data[0]; 

      if (!userProfile) {
        throw new Error('Perfil de usuário não encontrado.');
      }

      // --- O GRANDE TRADUTOR ---
      // Converte o português do banco para o inglês do código
      const roleMap: Record<string, "admin" | "manager" | "operator"> = {
        "ADMIN": "admin",
        "GERENTE": "manager",
        "OPERADOR": "operator"
      };

      // Pega o cargo do banco (ex: "OPERADOR") e traduz (ex: "operator")
      // Se não encontrar, assume "operator" por segurança
      const translatedRole = roleMap[userProfile.cargo] || "operator";

      const user: User = {
        id: userProfile.id.toString(),
        email: email,
        name: userProfile.nome_completo,
        role: translatedRole, // <--- AQUI ESTÁ A MÁGICA
        branchId: userProfile.filial ? userProfile.filial.toString() : undefined,
        isActive: userProfile.ativo,
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "" 
      };

      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  logout(): void {
    this.currentUser = null
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    localStorage.removeItem("currentUser")
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;

    if (typeof window !== 'undefined') {
        const token = Cookies.get('access_token');
        if (!token) {
            this.logout();
            return null;
        }

        const stored = localStorage.getItem("currentUser")
        if (stored) {
            try {
                return JSON.parse(stored)
            } catch {
                return null
            }
        }
    }
    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}

export const authService = new AuthService();
