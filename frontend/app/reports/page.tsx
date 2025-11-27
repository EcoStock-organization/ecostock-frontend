"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  Line,
  LineChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Package, TrendingUp, AlertTriangle, DollarSign, Activity, Download, FileText, BarChart3 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { mockBranches, mockProducts, getInventoryWithProducts } from "@/lib/mock-data"
import { useState } from "react"

export default function ReportsPage() {
  const { user } = useAuth()
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedPeriod, setSelectedPeriod] = useState<string>("month")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  // Filter branches based on user role
  const availableBranches = user?.role === "admin" ? mockBranches : mockBranches.filter((b) => b.id === user?.branchId)

  const inventory = getInventoryWithProducts()

  // Filter inventory by selected branch
  const filteredInventory =
    selectedBranch === "all" ? inventory : inventory.filter((item) => item.branchId === selectedBranch)

  // Calculate metrics
  const totalProducts = filteredInventory.reduce((sum, item) => sum + item.currentStock, 0)
  const lowStockItems = filteredInventory.filter((item) => item.currentStock < item.product.minStock).length
  const totalValue = filteredInventory.reduce((sum, item) => sum + item.currentStock * item.product.unitPrice, 0)
  const totalCost = filteredInventory.reduce((sum, item) => sum + item.currentStock * item.product.costPrice, 0)
  const grossProfit = totalValue - totalCost
  const criticalStockRate =
    filteredInventory.length > 0 ? ((lowStockItems / filteredInventory.length) * 100).toFixed(1) : "0"

  // Mock data for charts
  const stockMovementData = [
    { month: "Jan", receita: 12500, custo: 8200 },
    { month: "Fev", receita: 15200, custo: 9800 },
    { month: "Mar", receita: 14800, custo: 9500 },
    { month: "Abr", receita: 18900, custo: 12100 },
    { month: "Mai", receita: 17600, custo: 11200 },
    { month: "Jun", receita: 21500, custo: 13800 },
  ]

  const stockVariationData = [
    { month: "Jan", estoque: 450 },
    { month: "Fev", estoque: 520 },
    { month: "Mar", estoque: 480 },
    { month: "Abr", estoque: 610 },
    { month: "Mai", estoque: 580 },
    { month: "Jun", estoque: 650 },
  ]

  const branchComparisonData = [
    { name: "Filial Centro", receita: 45000 },
    { name: "Filial Zona Norte", receita: 38000 },
    { name: "Filial Shopping", receita: 22000 },
  ]

  const categoryPerformanceData = [
    { name: "Bebidas", value: 35 },
    { name: "Laticínios", value: 25 },
    { name: "Padaria", value: 20 },
    { name: "Limpeza", value: 20 },
  ]

  const COLORS = [
    "rgb(var(--chart-1) / 1)",
    "rgb(var(--chart-2) / 1)",
    "rgb(var(--chart-4) / 1)",
    "rgb(var(--chart-5) / 1)",
  ]

  const chartConfig = {
    receita: {
      label: "Receita",
      color: "hsl(var(--chart-1))",
    },
    custo: {
      label: "Custo",
      color: "hsl(var(--chart-2))",
    },
    estoque: {
      label: "Estoque",
      color: "hsl(var(--chart-1))",
    },
  }

  const handleExportPDF = () => {
    alert("Exportar PDF - Funcionalidade em desenvolvimento")
  }

  const handleExportCSV = () => {
    alert("Exportar CSV - Funcionalidade em desenvolvimento")
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Relatórios</h1>
            <p className="text-muted-foreground mt-1">Análise detalhada do estoque e movimentações</p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <FileText className="h-4 w-4" />
              PDF
            </Button>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-transparent"
            >
              <Download className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Período</label>
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Últimos 7 dias</SelectItem>
                    <SelectItem value="month">Mês atual</SelectItem>
                    <SelectItem value="quarter">Trimestre</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">Bebidas</SelectItem>
                    <SelectItem value="2">Laticínios</SelectItem>
                    <SelectItem value="3">Padaria</SelectItem>
                    <SelectItem value="4">Limpeza</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {user?.role === "admin" && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Filial</label>
                  <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as Filiais</SelectItem>
                      {availableBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand">
                R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">valor total</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">
                R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">custo de produtos</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lucro Bruto</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                R$ {grossProfit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">estimado</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Crítico</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{criticalStockRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">produtos abaixo do mínimo</p>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos Ativos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-brand">{mockProducts.filter((p) => p.isActive).length}</div>
              <p className="text-xs text-muted-foreground mt-1">cadastrados</p>
            </CardContent>
          </Card>
        </div>

        {/* Trend Analysis */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-brand" />
                Receita vs Custo Mensal
              </CardTitle>
              <CardDescription>Evolução dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <LineChart data={stockMovementData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="receita"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="custo"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-2))" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-brand" />
                Variação de Estoque
              </CardTitle>
              <CardDescription>Evolução dos últimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={stockVariationData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="estoque" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Branch Comparison (Admin Only) */}
        {user?.role === "admin" && (
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-brand" />
                Comparativo entre Filiais
              </CardTitle>
              <CardDescription>Receita por filial</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart data={branchComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis dataKey="name" type="category" className="text-xs" width={120} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="receita" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Category Performance */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand" />
              Desempenho por Categoria
            </CardTitle>
            <CardDescription>Distribuição de receita por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryPerformanceData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={80}
                    fill="rgb(var(--chart-3) / 1)"
                    dataKey="value"
                  >
                    {categoryPerformanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Detailed Table */}
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle>Detalhamento por Produto</CardTitle>
            <CardDescription>Lista completa de produtos e seus níveis de estoque</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-sm">Produto</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm">Categoria</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Estoque</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Mínimo</th>
                    <th className="text-right py-3 px-4 font-semibold text-sm">Valor Unit.</th>
                    <th className="text-center py-3 px-4 font-semibold text-sm">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => {
                    const isLow = item.currentStock < item.product.minStock
                    return (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                        <td className="py-3 px-4 text-sm font-medium">{item.product.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{item.product.category.name}</td>
                        <td className="py-3 px-4 text-sm text-right font-semibold">{item.currentStock}</td>
                        <td className="py-3 px-4 text-sm text-right text-muted-foreground">{item.product.minStock}</td>
                        <td className="py-3 px-4 text-sm text-right">R$ {item.product.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isLow ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
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
      </div>
    </DashboardLayout>
  )
}
