// Database schema types for the inventory management system

export interface User {
  id: string | number;
  email: string;
  name: string;
  role: "admin" | "manager" | "operator";
  branchId?: string | number;
  isActive?: boolean;
  password?: string;
  // ADICIONE ESTES DOIS CAMPOS:
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
  createdAt?: Date;
  updatedAt?: Date;
}

// === PRODUTOS ===

export interface Category {
  id: number;
  nome: string; // DEVE SER 'nome'
  descricao?: string;
}

export interface Product {
  id: number;
  codigo_barras: string; // DEVE SER 'codigo_barras'
  nome: string;          // DEVE SER 'nome'
  descricao?: string;
  tipo_produto: "UNITARIO" | "PESAVEL";
  esta_ativo: boolean;
  
  // Campos de leitura (vindos do serializer)
  categoria_nome?: string;
  
  // Campos de escrita (para enviar ao backend)
  id_categoria?: number;
  
  // Campos opcionais (UI)
  preco_venda?: number;
  preco_custo?: number;
  estoque_minimo?: number;
}

// Se o componente ProductSearch usa ProductWithCategory:
export interface ProductWithCategory extends Product {
  category?: Category; // Mantenha category
  // Adicione unitPrice, barcode, name aqui, se o mock ainda precisar:
  unitPrice?: number;
  barcode?: string;
  name?: string;
}

// === ESTOQUE ===

export interface InventoryItem {
  id: number;
  produto: Product; // O backend retorna o objeto aninhado
  quantidade_atual: number;
  preco_venda_atual: number; // O backend manda Decimal (string/number)
  quantidade_minima_estoque: number;
}

// Tipo auxiliar para formulários de estoque
export interface InventoryFormData {
  produto_id: string;
  quantidade_atual: string;
  preco_venda_atual: string;
  quantidade_minima_estoque: string;
}

// === VENDAS ===

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
  itens_venda: SaleItem[]; // Mantém para retrocompatibilidade se necessário
  itens?: SaleItem[];      // Adiciona o campo que o serializer VendaSerializer envia
}

// === FRONTEND ONLY (Carrinho) ===

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

// === DASHBOARD ===

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
  // InventoryItem já tem 'produto', mas aqui reforçamos tipagens extras se necessário
  branch?: Branch;
}
