"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Loader2 } from "lucide-react"
import { getRecentSales } from "@/services/dashboard-service"
import type { Sale } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function RecentSales() {
  const [sales, setSales] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getRecentSales()
      .then(setSales)
      .catch((err) => console.error("Erro ao buscar vendas recentes:", err))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card className="transition-organic hover-lift shadow-md border-2 border-border/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground font-display font-bold">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Vendas Recentes
        </CardTitle>
        <CardDescription>Últimas transações realizadas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-4">
               <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : sales.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">Nenhuma venda registrada.</p>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">Venda #{sale.id}</p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {/* Agora usamos a propriedade 'itens' definida na interface Sale */}
                    {sale.itens?.length || sale.itens_venda?.length || 0} itens • {formatDistanceToNow(new Date(sale.data_venda), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-sm font-bold text-foreground">
                    R$ {Number(sale.valor_total).toFixed(2)}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={`text-[10px] ${sale.status === 'FINALIZADA' ? 'bg-status-success/20 text-status-success' : 'bg-secondary'}`}
                  >
                    {sale.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}