// Mock data for development and demonstration
import type {
  User,
  Branch,
  Category,
  Product,
  InventoryItem,
  DashboardMetrics,
  StockAlert,
  ProductWithCategory,
  InventoryItemWithProduct,
} from "./types"

export const mockUsers: User[] = [
  {
    id: "1",
    email: "gustavo@supermarket.com",
    password: "admin123",
    name: "Gustavo Silva",
    role: "admin",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    email: "maria@supermarket.com",
    password: "manager123",
    name: "Maria Santos",
    role: "manager",
    branchId: "1",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    email: "joao@supermarket.com",
    password: "manager123",
    name: "João Oliveira",
    role: "manager",
    branchId: "2",
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "4",
    email: "pedro@supermarket.com",
    password: "operator123",
    name: "Pedro Alves",
    role: "operator",
    branchId: "1",
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
]

export const mockBranches: Branch[] = [
  {
    id: "1",
    name: "Filial Centro",
    address: "Rua das Flores, 123 - Centro",
    managerId: "2",
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Filial Zona Norte",
    address: "Av. Paulista, 456 - Zona Norte",
    managerId: "3",
    isActive: true,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "3",
    name: "Filial Shopping",
    address: "Shopping Center, Loja 789",
    managerId: "1",
    isActive: false,
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
]

export const mockCategories: Category[] = [
  {
    id: "1",
    name: "Bebidas",
    description: "Refrigerantes, sucos e águas",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Laticínios",
    description: "Leite, queijos e iogurtes",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Padaria",
    description: "Pães, bolos e doces",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Limpeza",
    description: "Produtos de limpeza doméstica",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Coca-Cola 2L",
    description: "Refrigerante Coca-Cola 2 litros",
    barcode: "7894900011517",
    categoryId: "1",
    unitPrice: 8.99,
    costPrice: 6.5,
    minStock: 50,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Leite Integral 1L",
    description: "Leite integral UHT 1 litro",
    barcode: "7891000100103",
    categoryId: "2",
    unitPrice: 4.5,
    costPrice: 3.2,
    minStock: 100,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "3",
    name: "Pão Francês",
    description: "Pão francês tradicional (kg)",
    barcode: "2000000000001",
    categoryId: "3",
    unitPrice: 12.9,
    costPrice: 8.5,
    minStock: 20,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "4",
    name: "Detergente Ypê",
    description: "Detergente líquido 500ml",
    barcode: "7896098900116",
    categoryId: "4",
    unitPrice: 2.99,
    costPrice: 1.8,
    minStock: 30,
    isActive: true,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
]

export const mockInventoryItems: InventoryItem[] = [
  {
    id: "1",
    productId: "1",
    branchId: "1",
    currentStock: 25,
    reservedStock: 5,
    lastRestockDate: new Date("2024-12-15"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-15"),
  },
  {
    id: "2",
    productId: "1",
    branchId: "2",
    currentStock: 80,
    reservedStock: 10,
    lastRestockDate: new Date("2024-12-20"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-20"),
  },
  {
    id: "3",
    productId: "2",
    branchId: "1",
    currentStock: 45,
    reservedStock: 0,
    lastRestockDate: new Date("2024-12-18"),
    expirationDate: new Date("2025-01-15"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-18"),
  },
  {
    id: "4",
    productId: "3",
    branchId: "1",
    currentStock: 8,
    reservedStock: 2,
    lastRestockDate: new Date("2024-12-27"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-12-27"),
  },
]

export const mockDashboardMetrics: DashboardMetrics = {
  totalRevenue: 125430.5,
  totalSales: 1247,
  lowStockItems: 12,
  activeBranches: 2,
  revenueGrowth: 15.3,
  salesGrowth: 8.7,
}

export const mockStockAlerts: StockAlert[] = [
  {
    id: "1",
    productId: "1",
    branchId: "1",
    type: "low_stock",
    message: "Coca-Cola 2L está com estoque baixo na Filial Centro (25 unidades)",
    severity: "medium",
    createdAt: new Date("2024-12-28"),
  },
  {
    id: "2",
    productId: "3",
    branchId: "1",
    type: "low_stock",
    message: "Pão Francês está com estoque crítico na Filial Centro (8 kg)",
    severity: "high",
    createdAt: new Date("2024-12-28"),
  },
  {
    id: "3",
    productId: "2",
    branchId: "1",
    type: "expiring_soon",
    message: "Leite Integral 1L vence em 18 dias na Filial Centro",
    severity: "low",
    createdAt: new Date("2024-12-28"),
  },
]

// Helper functions to get related data
export const getProductsWithCategories = (): ProductWithCategory[] => {
  return mockProducts.map((product) => ({
    ...product,
    category: mockCategories.find((cat) => cat.id === product.categoryId)!,
  }))
}

export const getInventoryWithProducts = (): InventoryItemWithProduct[] => {
  return mockInventoryItems.map((item) => ({
    ...item,
    product: {
      ...mockProducts.find((product) => product.id === item.productId)!,
      category: mockCategories.find(
        (cat) => cat.id === mockProducts.find((product) => product.id === item.productId)!.categoryId,
      )!,
    },
    branch: mockBranches.find((branch) => branch.id === item.branchId)!,
  }))
}
