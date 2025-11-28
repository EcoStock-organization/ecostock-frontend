"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Package, Loader2 } from "lucide-react"
import { getStockAlerts } from "@/services/dashboard-service"
import type { InventoryItem } from "@/lib/types"

export function StockAlerts() {
  const [alerts, setAlerts] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getStockAlerts()
      .then(setAlerts)
      .catch((err) => console.error("Erro ao buscar alertas:", err))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card className="transition-organic hover-lift shadow-md border-2 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-bold">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Alertas de Estoque
        </CardTitle>
        <CardDescription>Produtos com estoque baixo ou crítico</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
             <div className="flex justify-center py-4">
               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Estoque saudável! Nenhum alerta.</p>
          </div>
        ) : (
          alerts.map((item) => (
            <Alert key={item.id} className="border-l-[6px] border-l-status-warning rounded-lg">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="flex items-start justify-between w-full">
                <AlertDescription className="text-foreground font-medium">
                  {item.produto.nome} está acabando 
                  <span className="block text-xs font-normal text-muted-foreground mt-1">
                    Atual: {item.quantidade_atual} un
                  </span>
                </AlertDescription>
                <Badge variant="outline" className="ml-2 border-warning text-warning whitespace-nowrap">
                  Mín: {item.quantidade_minima_estoque}
                </Badge>
              </div>
            </Alert>
          ))
        )}
      </CardContent>
    </Card>
  )
}