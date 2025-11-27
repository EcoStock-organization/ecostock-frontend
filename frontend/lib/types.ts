// Database schema types for the inventory management system

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "admin" | "manager" | "operator"
  branchId?: string
  isActive?: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Branch {
  id: string
  name: string
  address: string
  managerId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface Product {
  id: string
  name: string
  description?: string
  barcode: string
  categoryId: string
  unitPrice: number
  costPrice: number
  minStock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface InventoryItem {
  id: string
  productId: string
  branchId: string
  currentStock: number
  reservedStock: number
  lastRestockDate?: Date
  expirationDate?: Date
  batchNumber?: string
  createdAt: Date
  updatedAt: Date
}

export interface Sale {
  id: string
  branchId: string
  userId: string
  totalAmount: number
  paymentMethod: "cash" | "card" | "pix"
  status: "completed" | "cancelled" | "pending"
  createdAt: Date
  updatedAt: Date
}

export interface SaleItem {
  id: string
  saleId: string
  productId: string
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: Date
}

export interface StockMovement {
  id: string
  productId: string
  branchId: string
  type: "in" | "out" | "transfer" | "adjustment"
  quantity: number
  reason: string
  userId: string
  createdAt: Date
}

// Extended types with relations for UI
export interface ProductWithCategory extends Product {
  category: Category
}

export interface InventoryItemWithProduct extends InventoryItem {
  product: ProductWithCategory
  branch: Branch
}

export interface SaleWithItems extends Sale {
  items: (SaleItem & { product: Product })[]
  user: User
  branch: Branch
}

export interface CartItem {
  productId: string
  product: Product
  quantity: number
  unitPrice: number
}

export interface CheckoutSession {
  items: CartItem[]
  subtotal: number
  discount: number
  total: number
  paymentMethod?: "cash" | "card" | "pix"
}

// Dashboard metrics types
export interface DashboardMetrics {
  totalRevenue: number
  totalSales: number
  lowStockItems: number
  activeBranches: number
  revenueGrowth: number
  salesGrowth: number
}

export interface StockAlert {
  id: string
  productId: string
  branchId: string
  type: "low_stock" | "out_of_stock" | "expiring_soon"
  message: string
  severity: "low" | "medium" | "high"
  createdAt: Date
}
