"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Plus, Edit, AlertTriangle, CheckCircle2, AlertCircle, Package2 } from "lucide-react"
import { getInventoryWithProducts, mockBranches } from "@/lib/mock-data"
import { InventoryForm } from "./inventory-form"
import type { InventoryItemWithProduct } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function InventoryTable() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [isUpdating, setIsUpdating] = useState<string | null>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const isManager = user?.role === "manager"
  const userBranchId = user?.branchId

  const inventoryData = getInventoryWithProducts()
  const [refreshKey, setRefreshKey] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItemWithProduct | null>(null)
  const triggerRefresh = () => setRefreshKey((k) => k + 1)

  const filteredData = inventoryData.filter((item) => {
    const matchesSearch =
      item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.product.barcode.includes(searchTerm)

    const matchesBranch = isManager
      ? item.branchId === userBranchId
      : selectedBranch === "all" || item.branchId === selectedBranch

    const matchesStock =
      stockFilter === "all" ||
      (stockFilter === "low" && item.currentStock <= item.product.minStock) ||
      (stockFilter === "out" && item.currentStock === 0) ||
      (stockFilter === "normal" && item.currentStock > item.product.minStock)

    return matchesSearch && matchesBranch && matchesStock
  })

  const getStockStatus = (item: InventoryItemWithProduct) => {
    if (item.currentStock === 0) {
      return {
        label: "Sem Estoque",
        icon: AlertTriangle,
        className: "bg-status-critical text-status-critical-foreground border-status-critical",
        severity: "high",
      }
    }
    if (item.currentStock <= item.product.minStock) {
      return {
        label: "Estoque Baixo",
        icon: AlertCircle,
        className: "bg-status-warning text-status-warning-foreground border-status-warning",
        severity: "medium",
      }
    }
    return {
      label: "Normal",
      icon: CheckCircle2,
      className: "bg-status-success text-status-success-foreground border-status-success",
      severity: "low",
    }
  }

  const handleUpdateStock = async (itemId: string, itemName: string) => {
    setIsUpdating(itemId)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    setIsUpdating(null)
    toast({
      title: "Estoque atualizado",
      description: `${itemName} foi atualizado com sucesso.`,
      duration: 3000,
    })
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="transition-smooth hover:shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros
          </CardTitle>
          <CardDescription>
            {isManager ? "Filtre os produtos por nome" : "Filtre os produtos por nome, filial ou status do estoque"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código de barras... "
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-smooth focus:ring-2 focus:ring-primary"
                  aria-label="Buscar produtos"
                  accessKey="k"
                />
              </div>
            </div>
            {!isManager && (
              <>
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-full sm:w-48 transition-smooth">
                    <SelectValue placeholder="Selecionar filial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Filiais</SelectItem>
                    {mockBranches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
            <Select value={stockFilter} onValueChange={setStockFilter}>
              <SelectTrigger className="w-full sm:w-48 transition-smooth">
                <SelectValue placeholder="Status do estoque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="normal">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-status-success" />
                    Estoque Normal
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-status-warning" />
                    Estoque Baixo
                  </div>
                </SelectItem>
                <SelectItem value="out">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-status-critical" />
                    Sem Estoque
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="transition-smooth hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-primary" />
              Controle de Estoque
            </CardTitle>
            <CardDescription>
              {filteredData.length} {filteredData.length === 1 ? "produto encontrado" : "produtos encontrados"}
            </CardDescription>
          </div>
          <Button
            className="flex items-center gap-2 transition-smooth hover:scale-105"
            onClick={() => {
              setEditingItem(null)
              setIsFormOpen(true)
            }}
          >
            <Plus className="h-4 w-4" />
            Adicionar Produto
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  {!isManager && <TableHead>Filial</TableHead>}
                  <TableHead className="text-center">Estoque Atual</TableHead>
                  <TableHead className="text-center">Estoque Mínimo</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isManager ? 7 : 8} className="text-center py-8 text-muted-foreground">
                      Nenhum produto encontrado com os filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((item) => {
                    const status = getStockStatus(item)
                    const StatusIcon = status.icon
                    

                    return (
                      <TableRow key={item.id} className="transition-smooth hover:bg-muted/50">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{item.product.name}</p>
                            <p className="text-xs text-muted-foreground font-mono">{item.product.barcode}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="transition-smooth">
                            {item.product.category.name}
                          </Badge>
                        </TableCell>
                        {!isManager && <TableCell className="text-foreground">{item.branch.name}</TableCell>}
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {status.severity !== "low" && (
                              <StatusIcon
                                className={cn(
                                  "h-4 w-4",
                                  status.severity === "high" && "text-status-critical",
                                  status.severity === "medium" && "text-status-warning",
                                )}
                              />
                            )}
                            <span
                              className={cn(
                                "font-semibold text-lg",
                                status.severity === "high" && "text-status-critical",
                                status.severity === "medium" && "text-status-warning",
                                status.severity === "low" && "text-status-success",
                              )}
                            >
                              {item.currentStock}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.product.minStock}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn(status.className, "transition-smooth font-medium")}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-foreground">
                          R$ {item.product.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2 min-h-10">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // open edit form
                                setEditingItem(item)
                                setIsFormOpen(true)
                              }}
                              className="transition-smooth hover:scale-110 inline-flex"
                              aria-label={`Editar ${item.product.name}`}
                            >
                              <Edit className="h-4 w-4 inline-flex" />
                            </Button>
                            {isManager && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="transition-smooth hover:scale-110 bg-status-success/30 text-status-success border-status-success hover:bg-status-success/40 hover:text-status-success-foreground rounded-lg h-8 px-3 text-xs font-medium inline-flex items-center shadow-sm"
                                aria-label={`Solicitar reposição de ${item.product.name}`}
                                onClick={() => {
                                  toast({
                                    title: "Solicitação de reposição enviada com sucesso!",
                                    duration: 3000,
                                  })
                                }}
                              >
                                <Plus className="h-3.5 w-3.5 mr-1.5 inline-flex" />
                                Solicitar reposição
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Add/Edit Form */}
      <InventoryForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        item={editingItem ?? undefined}
        onSave={() => {
          // trigger a refresh to re-read mock data
          triggerRefresh()
        }}
      />
    </div>
  )
}
