// Authentication utilities and context
import type { User } from "./types"
import { mockUsers } from "./mock-data"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
}

// Mock authentication service
export class AuthService {
  private static instance: AuthService
  private currentUser: User | null = null

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService()
    }
    return AuthService.instance
  }

  async login(email: string, password: string): Promise<User | null> {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email && u.password === password)
    if (user) {
      this.currentUser = user
      // In a real app, you'd store JWT token in localStorage/cookies
      localStorage.setItem("currentUser", JSON.stringify(user))
      return user
    }
    return null
  }

  logout(): void {
    this.currentUser = null
    localStorage.removeItem("currentUser")
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem("currentUser")
    if (stored) {
      this.currentUser = JSON.parse(stored)
      return this.currentUser
    }

    return null
  }

  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  }
}
