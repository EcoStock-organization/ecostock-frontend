"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { TrendingUp, Activity, Download, FileText, Loader2 } from "lucide-react"
import { getSalesChartData, getCategoryChartData, type SalesChartData, type CategoryChartData } from "@/services/reports-service"

export default function ReportsPage() {
  const [salesData, setSalesData] = useState<SalesChartData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryChartData[]>([])
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
            <p className="text-muted-foreground mt-1">Análise de desempenho financeiro e estoque</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" /> CSV
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Gráfico de Linha: Receita */}
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-brand" />
                  Receita vs Custo (6 Meses)
                </CardTitle>
                <CardDescription>Evolução financeira mensal</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line type="monotone" dataKey="receita" stroke="var(--color-receita)" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="custo" stroke="var(--color-custo)" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Pizza: Categorias */}
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
                        // CORREÇÃO AQUI: (percent || 0)
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
        )}
      </div>
    </DashboardLayout>
  )
}