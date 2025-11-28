"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { DollarSign, ShoppingCart, Package, Building2, Leaf } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Novos imports
import { getDashboardMetrics } from "@/services/dashboard-service"
import type { DashboardMetrics } from "@/lib/types"

export default function DashboardPage() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"
  
  // Estado para as métricas reais
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Buscar dados ao carregar
  useEffect(() => {
    getDashboardMetrics()
      .then(setMetrics)
      .catch((err) => console.error("Erro ao carregar dashboard:", err))
      .finally(() => setIsLoading(false))
  }, [])

  // Valores padrão ou de loading
  const displayMetrics = metrics || {
    totalRevenue: 0,
    totalSales: 0,
    lowStockItems: 0,
    activeBranches: 0,
    revenueGrowth: 0,
    salesGrowth: 0
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header de Boas-vindas */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 animate-leaf-float">
              <Leaf className="h-10 w-10 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-display tracking-tight">
                Olá, {user?.name?.split(" ")[0] || "Usuário"}
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">
                Visão geral do seu negócio em tempo real
              </p>
            </div>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className={`grid gap-6 ${isManager ? "md:grid-cols-3 lg:max-w-2xl mx-auto" : "md:grid-cols-2 lg:grid-cols-4"} animate-slide-up`}>
          
          <MetricCard
            title="Receita Total"
            value={isLoading ? "..." : `R$ ${displayMetrics.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            change={displayMetrics.revenueGrowth}
            icon={DollarSign}
          />
          
          <MetricCard
            title="Vendas Realizadas"
            value={isLoading ? "..." : displayMetrics.totalSales.toLocaleString("pt-BR")}
            change={displayMetrics.salesGrowth}
            icon={ShoppingCart}
          />
          
          <MetricCard 
            title="Estoque Baixo" 
            value={isLoading ? "..." : displayMetrics.lowStockItems} 
            icon={Package} 
            variant={displayMetrics.lowStockItems > 0 ? "warning" : "default"} 
          />
          
          {!isManager && (
            <MetricCard 
                title="Filiais Ativas" 
                value={isLoading ? "..." : displayMetrics.activeBranches} 
                icon={Building2} 
            />
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <StockAlerts />
          <RecentSales />
        </div>
      </div>
    </DashboardLayout>
  )
}