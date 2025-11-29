import type { User, Branch, Product, Category } from "./types"

export const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@example.com",
    name: "Admin User",
    role: "admin",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const mockBranches: Branch[] = [
  {
    id: 1,
    nome: "Filial Centro",
    cep: "00000-000",
    logradouro: "Rua Teste",
    cidade: "Cidade",
    estado: "UF",
    esta_ativa: true,
  },
]

export const mockCategories: Category[] = [
  { id: 1, nome: "Geral" },
]

export const mockProducts: Product[] = [
  {
    id: 1,
    codigo_barras: "123456789",
    nome: "Produto Teste",
    tipo_produto: "UNITARIO",
    esta_ativo: true,
    id_categoria: 1,
    categoria_nome: "Geral"
  },
]

export const getProductsWithCategories = (): Product[] => mockProducts;

export const getInventoryWithProducts = (): unknown[] => [];
export const mockDashboardMetrics = { totalRevenue: 0, totalSales: 0 };
export const mockStockAlerts = [];