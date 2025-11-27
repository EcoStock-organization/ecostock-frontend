"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { MetricCard } from "@/components/dashboard/metric-card"
import { StockAlerts } from "@/components/dashboard/stock-alerts"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { mockDashboardMetrics, getInventoryWithProducts } from "@/lib/mock-data"
import { DollarSign, ShoppingCart, Package, Building2, Leaf } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"
  const userBranchId = user?.branchId

  let metrics = mockDashboardMetrics

  if (isManager && userBranchId) {
    // Filter inventory data for manager's branch
    const inventoryData = getInventoryWithProducts()
    const managerInventory = inventoryData.filter((item) => item.branchId === userBranchId)

    // Calculate manager-specific metrics
    const totalRevenue = managerInventory.reduce((sum, item) => {
      return sum + item.currentStock * item.product.unitPrice
    }, 0)

    const totalSales = managerInventory.reduce((sum, item) => {
      return sum + item.currentStock
    }, 0)

    const lowStockItems = managerInventory.filter((item) => item.currentStock <= item.product.minStock).length

    metrics = {
      totalRevenue,
      totalSales,
      lowStockItems,
      activeBranches: 1,
      revenueGrowth: 12.5,
      salesGrowth: 7.2,
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-brand/10 animate-leaf-float">
              <Leaf className="h-10 w-10 text-brand" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-foreground font-display tracking-tight">
                {user?.name?.split(" ")[0] || "Usuário"}
              </h1>
              <p className="text-muted-foreground text-sm font-medium mt-1">Gestão sustentável de estoques</p>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-6 ${isManager ? "md:grid-cols-3 lg:max-w-2xl mx-auto" : "md:grid-cols-2 lg:grid-cols-4"} animate-slide-up`}
        >
          <MetricCard
            title="Receita"
            value={`R$ ${metrics.totalRevenue.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
            change={metrics.revenueGrowth}
            icon={DollarSign}
          />
          <MetricCard
            title="Vendas"
            value={metrics.totalSales.toLocaleString("pt-BR")}
            change={metrics.salesGrowth}
            icon={ShoppingCart}
          />
          <MetricCard title="Atenção" value={metrics.lowStockItems} icon={Package} variant="warning" />
          {!isManager && <MetricCard title="Filiais" value={metrics.activeBranches} icon={Building2} />}
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <StockAlerts />
          <RecentSales />
        </div>
      </div>
    </DashboardLayout>
  )
}
