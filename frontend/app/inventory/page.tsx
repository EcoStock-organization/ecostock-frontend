"use client"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { StockSummary } from "@/components/inventory/stock-summary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function InventoryPage() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestão de Estoque</h1>
          <p className="text-muted-foreground">
            {isManager
              ? "Controle e monitore o estoque de produtos"
              : "Controle e monitore o estoque de produtos em todas as filiais"}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-96">
            <TabsTrigger value="inventory" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Resumo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <InventoryTable />
          </TabsContent>

          <TabsContent value="summary">
            <StockSummary />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
