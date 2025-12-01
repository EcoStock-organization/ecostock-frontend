export interface User {
  id: string | number;
  email: string;
  name: string;
  role: "admin" | "manager" | "operator";
  branchId?: string | number;
  isActive?: boolean;
  password?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Branch {
  id: number;
  nome: string;
  cep: string;
  logradouro: string;
  cidade: string;
  estado: string;
  gerente_id?: number | null;
  esta_ativa: boolean;
  total_produtos?: number;
  total_vendas?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Product {
  id: number;
  codigo_barras: string;
  nome: string;
  descricao?: string;
  tipo_produto: "UNITARIO" | "PESAVEL";
  esta_ativo: boolean;
  categoria_nome?: string;
  id_categoria?: number;
  preco_venda?: number;
  preco_custo?: number;
  estoque_minimo?: number;
}

export interface ProductWithCategory extends Product {
  category?: Category; // Mantenha category
  unitPrice?: number;
  barcode?: string;
  name?: string;
}

export interface InventoryItem {
  id: number;
  produto: Product;
  quantidade_atual: number;
  preco_venda_atual: number;
  quantidade_minima_estoque: number;
}

export interface InventoryFormData {
  produto_id: string;
  quantidade_atual: string;
  preco_venda_atual: string;
  quantidade_minima_estoque: string;
}

export interface SaleItem {
  id: number;
  produto: number;
  produto_nome?: string;
  quantidade_vendida: number;
  preco_vendido: number;
}

export interface Sale {
  id: number;
  filial: number;
  usuario_id: number;
  data_venda: string;
  status: "ABERTA" | "FINALIZADA" | "CANCELADA";
  forma_pagamento: string | null;
  valor_total: number;
  itens_venda: SaleItem[]; 
  itens?: SaleItem[];      
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutSession {
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod?: "cash" | "card" | "pix";
}

export interface DashboardMetrics {
  totalRevenue: number;
  totalSales: number;
  lowStockItems: number;
  activeBranches: number;
  revenueGrowth: number;
  salesGrowth: number;
}

export interface StockAlert {
  id: string;
  productId: string;
  branchId: string;
  type: "low_stock" | "out_of_stock" | "expiring_soon";
  message: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
}

export interface InventoryItemWithProduct extends InventoryItem {
  branch?: Branch;
}
