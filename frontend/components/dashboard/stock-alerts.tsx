"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, Package } from "lucide-react"
import { mockStockAlerts } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

export function StockAlerts() {
  const { user } = useAuth()
  const isManager = user?.role === "manager"
  const userBranchId = user?.branchId

  const filteredAlerts = isManager
    ? mockStockAlerts.filter((alert) => alert.branchId === userBranchId)
    : mockStockAlerts

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getSeverityIcon = (type: string) => {
    switch (type) {
      case "low_stock":
      case "out_of_stock":
        return Package
      case "expiring_soon":
        return Clock
      default:
        return AlertTriangle
    }
  }

  const getSeverityBorderColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "border-l-status-critical" // Vermelho-terra
      case "medium":
        return "border-l-status-warning" // Amarelo-oliva
      case "low":
        return "border-l-status-success" // Verde escuro
      default:
        return "border-l-border"
    }
  }

  return (
    <Card
      className={cn(
        "transition-organic hover-lift shadow-md border-2 border-border/60 bg-gradient-to-br from-card to-card/95",
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground font-display font-bold">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Alertas de Estoque
        </CardTitle>
        <CardDescription className="text-muted-foreground font-medium">
          Produtos que precisam de atenção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <p className="text-sm text-muted-foreground font-medium">Nenhum alerta no momento</p>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = getSeverityIcon(alert.type)
            return (
              <Alert
                key={alert.id}
                className={cn(
                  "border-l-[6px] transition-organic hover:shadow-lg animate-slide-up rounded-xl border-2 border-border/40",
                  getSeverityBorderColor(alert.severity),
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex items-start justify-between">
                  <AlertDescription className="flex-1 text-foreground font-medium">{alert.message}</AlertDescription>
                  <Badge
                    variant={getSeverityColor(alert.severity)}
                    className="ml-2 transition-organic rounded-full shadow-sm font-semibold"
                  >
                    {alert.severity === "high" && "Alto"}
                    {alert.severity === "medium" && "Médio"}
                    {alert.severity === "low" && "Baixo"}
                  </Badge>
                </div>
              </Alert>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
