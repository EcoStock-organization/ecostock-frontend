"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductGrid } from "@/components/products/product-grid"
import { ProtectedRoute } from "@/components/protected-route"

export default function ProductsPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <DashboardLayout>
        <div className="p-6">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl font-bold text-foreground">Catálogo de Produtos</h1>
            <p className="text-muted-foreground">Gerencie produtos, preços e categorias</p>
          </div>

          <ProductGrid />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
