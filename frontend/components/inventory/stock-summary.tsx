import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getInventoryWithProducts } from "@/lib/mock-data"
import { Package, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react"

export function StockSummary() {
  const inventoryData = getInventoryWithProducts()

  const totalProducts = inventoryData.length
  const outOfStock = inventoryData.filter((item) => item.currentStock === 0).length
  const lowStock = inventoryData.filter(
    (item) => item.currentStock > 0 && item.currentStock <= item.product.minStock,
  ).length
  const normalStock = totalProducts - outOfStock - lowStock

  const totalValue = inventoryData.reduce((sum, item) => sum + item.currentStock * item.product.unitPrice, 0)

  const summaryCards = [
    {
      title: "Total de Produtos",
      value: totalProducts,
      icon: Package,
      description: "Produtos cadastrados",
    },
    {
      title: "Estoque Normal",
      value: normalStock,
      icon: TrendingUp,
      description: "Produtos com estoque adequado",
      color: "text-green-600",
    },
    {
      title: "Estoque Baixo",
      value: lowStock,
      icon: AlertTriangle,
      description: "Produtos precisando reposição",
      color: "text-yellow-600",
    },
    {
      title: "Sem Estoque",
      value: outOfStock,
      icon: TrendingDown,
      description: "Produtos esgotados",
      color: "text-red-600",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
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

      {/* Stock Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Distribuição do Estoque</CardTitle>
          <CardDescription>Visão geral do status dos produtos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Estoque Normal</span>
              <span>
                {normalStock} produtos ({((normalStock / totalProducts) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress value={(normalStock / totalProducts) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Estoque Baixo</span>
              <span>
                {lowStock} produtos ({((lowStock / totalProducts) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress value={(lowStock / totalProducts) * 100} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sem Estoque</span>
              <span>
                {outOfStock} produtos ({((outOfStock / totalProducts) * 100).toFixed(1)}%)
              </span>
            </div>
            <Progress value={(outOfStock / totalProducts) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Total Value */}
      <Card>
        <CardHeader>
          <CardTitle>Valor Total do Estoque</CardTitle>
          <CardDescription>Valor monetário dos produtos em estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">
            R$ {totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-sm text-muted-foreground mt-1">Baseado nos preços de venda atuais</p>
        </CardContent>
      </Card>
    </div>
  )
}
