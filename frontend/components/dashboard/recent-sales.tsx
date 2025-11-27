"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

// Mock recent sales data
const recentSales = [
  {
    id: "1",
    branch: "Filial Centro",
    branchId: "1",
    amount: 234.5,
    items: 12,
    time: "há 5 min",
    status: "completed",
  },
  {
    id: "2",
    branch: "Filial Zona Norte",
    branchId: "2",
    amount: 89.9,
    items: 4,
    time: "há 12 min",
    status: "completed",
  },
  {
    id: "3",
    branch: "Filial Centro",
    branchId: "1",
    amount: 156.8,
    items: 8,
    time: "há 18 min",
    status: "completed",
  },
  {
    id: "4",
    branch: "Filial Zona Norte",
    branchId: "2",
    amount: 67.3,
    items: 3,
    time: "há 25 min",
    status: "completed",
  },
  {
    id: "5",
    branch: "Filial Centro",
    branchId: "1",
    amount: 445.2,
    items: 18,
    time: "há 32 min",
    status: "completed",
  },
]

export function RecentSales() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"
  const userBranchId = user?.branchId

  const filteredSales = isManager ? recentSales.filter((sale) => sale.branchId === userBranchId) : recentSales

  return (
    <Card className="transition-organic hover-lift shadow-md border-2 border-border/60 bg-gradient-to-br from-card to-card/95">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground font-display font-bold">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Vendas Recentes
        </CardTitle>
        <CardDescription className="text-muted-foreground font-medium">Últimas transações realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSales.map((sale) => (
            <div
              key={sale.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 transition-organic hover:bg-muted/50 hover:shadow-md hover-lift cursor-pointer animate-slide-up"
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">{sale.branch}</p>
                <p className="text-xs text-muted-foreground font-medium">
                  {sale.items} {sale.items === 1 ? "item" : "itens"} • {sale.time}
                </p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-sm font-bold text-foreground">R$ {sale.amount.toFixed(2)}</p>
                <Badge
                  variant="secondary"
                  className="text-xs bg-status-success/20 text-status-success border border-status-success/30 transition-organic shadow-sm font-semibold"
                >
                  Concluída
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
