"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Activity, Download, FileText, Loader2 } from "lucide-react"
import { getSalesChartData, getCategoryChartData, type SalesChartData, type CategoryChartData } from "@/services/reports-service"
import { getBranches } from "@/services/branchService"
import { getBranchStock } from "@/services/stock-service"
import type { InventoryItem } from "@/lib/types"

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<SalesChartData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryChartData[]>([])
  const [fullInventory, setFullInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [salesRes, categoryRes] = await Promise.all([
          getSalesChartData(),
          getCategoryChartData()
        ])
        setSalesData(salesRes)
        setCategoryData(categoryRes)

        const branchList = await getBranches()
        const activeBranches = branchList.filter(b => b.esta_ativa)

        let allItems: InventoryItem[] = []
        
        for (const branch of activeBranches) {
          try {
            const stock = await getBranchStock(branch.id.toString())
            allItems = [...allItems, ...stock]
          } catch {
            console.warn(`Não foi possível carregar estoque da filial ${branch.nome}`)
          }
        }
        setFullInventory(allItems)

      } catch (error) {
        console.error("Erro ao carregar relatórios:", error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const COLORS = [
    "rgb(var(--chart-1) / 1)",
    "rgb(var(--chart-2) / 1)",
    "rgb(var(--chart-4) / 1)",
    "rgb(var(--chart-5) / 1)",
  ]

  const chartConfig = {
    receita: { label: "Receita", color: "hsl(var(--chart-1))" },
    custo: { label: "Custo (Est.)", color: "hsl(var(--chart-2))" },
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Análise de desempenho financeiro e estoque global</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 w-full">
                <Card className="hover-lift">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-brand" />
                    Vendas por Categoria
                    </CardTitle>
                    <CardDescription>Participação na receita total</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
                </Card>
            </div>

            <Card className="hover-lift">
                <CardHeader>
                    <CardTitle>Detalhamento de Inventário Global</CardTitle>
                    <CardDescription>{fullInventory.length} itens rastreados em todas as filiais ativas.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Produto</th>
                                    <th className="text-left py-3 px-4 font-semibold text-sm">Cód. Barras</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Estoque</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Mínimo</th>
                                    <th className="text-right py-3 px-4 font-semibold text-sm">Preço Venda</th>
                                    <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fullInventory.map((item) => {
                                    const isLow = item.quantidade_atual <= item.quantidade_minima_estoque
                                    return (
                                        <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                                            <td className="py-3 px-4 text-sm font-medium">{item.produto.nome}</td>
                                            <td className="py-3 px-4 text-sm text-muted-foreground font-mono">{item.produto.codigo_barras}</td>
                                            <td className="py-3 px-4 text-sm text-right font-bold">{item.quantidade_atual}</td>
                                            <td className="py-3 px-4 text-sm text-right text-muted-foreground">{item.quantidade_minima_estoque}</td>
                                            <td className="py-3 px-4 text-sm text-right">R$ {Number(item.preco_venda_atual).toFixed(2)}</td>
                                            <td className="py-3 px-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        isLow ? "bg-destructive/10 text-destructive" : "bg-status-success/10 text-status-success"
                                                    }`}
                                                >
                                                    {isLow ? "Baixo" : "Normal"}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}