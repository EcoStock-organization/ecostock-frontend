"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Package, AlertTriangle, TrendingUp, TrendingDown, Loader2, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { getBranches } from "@/services/branchService"
import { getBranchStock } from "@/services/stock-service"
import type { InventoryItem, Branch } from "@/lib/types"

export function StockSummary() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>("all")

  const [stats, setStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    lowStock: 0,
    normalStock: 0,
    totalValue: 0
  })

  useEffect(() => {
      const loadBranches = async () => {
          if (user?.role === 'admin') {
              try {
                  const data = await getBranches()
                  setBranches(data)
              } catch (e) {
                  console.error(e)
              }
          }
      }
      loadBranches()
  }, [user])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const allItems: InventoryItem[] = []
        
        let targetBranchIds: string[] = []

        if (user?.role === 'manager' && user.branchId) {
             targetBranchIds = [user.branchId.toString()]
        } else if (user?.role === 'admin') {
             if (selectedFilter === 'all') {
                 targetBranchIds = branches.filter(b => b.esta_ativa).map(b => b.id.toString())
             } else {
                 targetBranchIds = [selectedFilter]
             }
        }

        if (targetBranchIds.length === 0 && user?.role === 'admin' && branches.length === 0) {
            return; 
        }

        const promises = targetBranchIds.map(id => getBranchStock(id))
        const results = await Promise.all(promises)
        
        results.forEach(items => allItems.push(...items))

        const totalProducts = allItems.length
        const outOfStock = allItems.filter(i => i.quantidade_atual === 0).length
        const lowStock = allItems.filter(i => i.quantidade_atual > 0 && i.quantidade_atual <= i.quantidade_minima_estoque).length
        const normalStock = totalProducts - outOfStock - lowStock
        const totalValue = allItems.reduce((acc, i) => acc + (i.quantidade_atual * Number(i.preco_venda_atual)), 0)

        setStats({ totalProducts, outOfStock, lowStock, normalStock, totalValue })

      } catch (error) {
        console.error("Erro ao carregar resumo:", error)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user, branches, selectedFilter])

  const summaryCards = [
    { title: "Total de Itens", value: stats.totalProducts, icon: Package, description: "Itens rastreados" },
    { title: "Estoque Normal", value: stats.normalStock, icon: TrendingUp, description: "Níveis adequados", color: "text-green-600" },
    { title: "Estoque Baixo", value: stats.lowStock, icon: AlertTriangle, description: "Abaixo do mínimo", color: "text-yellow-600" },
    { title: "Esgotados", value: stats.outOfStock, icon: TrendingDown, description: "Sem estoque", color: "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      {/* Filtro para Admin */}
      {user?.role === 'admin' && (
          <div className="flex justify-end">
              <div className="w-64">
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                    <SelectTrigger>
                        <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Filtrar por Filial" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as Filiais</SelectItem>
                        {branches.map(b => (
                            <SelectItem key={b.id} value={b.id.toString()}>{b.nome}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
              </div>
          </div>
      )}

      {loading ? (
          <div className="flex justify-center p-12">
              <Loader2 className="animate-spin h-8 w-8 text-primary"/>
          </div>
      ) : (
        <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {summaryCards.map((card) => (
                <Card key={card.title}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
                    <card.icon className={`h-4 w-4 ${card.color || "text-muted-foreground"}`} />
                    </CardHeader>
                    <CardContent>
                    <div className={`text-2xl font-bold ${card.color || "text-foreground"}`}>{card.value}</div>
                    <p className="text-xs text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                    <CardTitle>Saúde do Estoque</CardTitle>
                    <CardDescription>Proporção de itens por status</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Normal</span>
                                <span>{stats.normalStock} ({stats.totalProducts > 0 ? ((stats.normalStock/stats.totalProducts)*100).toFixed(0) : 0}%)</span>
                            </div>
                            <Progress value={stats.totalProducts > 0 ? (stats.normalStock/stats.totalProducts)*100 : 0} className="bg-green-100 [&>div]:bg-green-600" />
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Baixo</span>
                                <span>{stats.lowStock} ({stats.totalProducts > 0 ? ((stats.lowStock/stats.totalProducts)*100).toFixed(0) : 0}%)</span>
                            </div>
                            <Progress value={stats.totalProducts > 0 ? (stats.lowStock/stats.totalProducts)*100 : 0} className="bg-yellow-100 [&>div]:bg-yellow-600"/>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Esgotado</span>
                                <span>{stats.outOfStock} ({stats.totalProducts > 0 ? ((stats.outOfStock/stats.totalProducts)*100).toFixed(0) : 0}%)</span>
                            </div>
                            <Progress value={stats.totalProducts > 0 ? (stats.outOfStock/stats.totalProducts)*100 : 0} className="bg-red-100 [&>div]:bg-red-600"/>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                    <CardTitle>Valor em Estoque</CardTitle>
                    <CardDescription>Estimativa baseada no preço de venda atual</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col justify-center h-full pb-10">
                        <div className="text-4xl font-bold text-foreground mb-2">
                            R$ {stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-muted-foreground">
                            {user?.role === 'admin' && selectedFilter === 'all' 
                                ? "Valor total acumulado em todas as filiais." 
                                : "Valor total nesta filial."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
      )}
    </div>
  )
}