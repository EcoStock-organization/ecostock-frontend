"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Filter, Plus, Edit, AlertTriangle, CheckCircle2, AlertCircle, Package2 } from "lucide-react"
import { InventoryForm } from "./inventory-form"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { coreApi } from "@/lib/api"
import type { InventoryItem, Branch } from "@/lib/types"

export function InventoryTable() {
  const { user } = useAuth()
  const { toast } = useToast()
  const isManager = user?.role === "manager"

  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | undefined>()

  useEffect(() => {
    const loadBranches = async () => {
      if (isManager && user?.branchId) {
        setSelectedBranchId(user.branchId.toString())
      } else {
        try {
          const res = await coreApi.get("/filiais/")
          setBranches(res.data)
          if (res.data.length > 0) {
            setSelectedBranchId(res.data[0].id.toString())
          }
        } catch (error) {
          console.error("Erro ao carregar filiais", error)
        }
      }
    }
    loadBranches()
  }, [isManager, user])

  const fetchInventory = useCallback(async () => {
    if (!selectedBranchId) return

    setIsLoading(true)
    try {
      const res = await coreApi.get(`/filiais/${selectedBranchId}/estoque/`)
      setInventory(res.data)
    } catch (error) {
      console.error("Erro ao carregar estoque", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar o estoque desta filial.",
        variant: "destructive"
      })
      setInventory([])
    } finally {
      setIsLoading(false)
    }
  }, [selectedBranchId, toast])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  const filteredData = inventory.filter((item) => {
    const matchesSearch =
      item.produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.produto.codigo_barras.includes(searchTerm)
    return matchesSearch
  })

  const getStockStatus = (item: InventoryItem) => {
    if (item.quantidade_atual === 0) {
      return {
        label: "Sem Estoque",
        icon: AlertTriangle,
        className: "bg-destructive/10 text-destructive border-destructive/20",
        severity: "high",
      }
    }
    if (item.quantidade_atual <= item.quantidade_minima_estoque) {
      return {
        label: "Baixo",
        icon: AlertCircle,
        className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
        severity: "medium",
      }
    }
    return {
      label: "Normal",
      icon: CheckCircle2,
      className: "bg-green-500/10 text-green-600 border-green-500/20",
      severity: "low",
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  const handleDelete = async (itemId: number) => {
    if (!confirm("Remover este item do estoque?")) return
    try {
        await coreApi.delete(`/filiais/${selectedBranchId}/estoque/${itemId}/`)
        setInventory(prev => prev.filter(i => i.id !== itemId))
        toast({ title: "Item removido" })
    } catch (error) {
        toast({ title: "Erro ao remover", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros e Seleção de Filial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtros & Localização
          </CardTitle>
          <CardDescription>Selecione a filial para gerenciar o estoque</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {!isManager && (
              <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                <SelectTrigger className="w-full sm:w-64">
                  <SelectValue placeholder="Selecione a Filial" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id.toString()}>
                      {b.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="h-5 w-5 text-primary" />
              Itens em Estoque
            </CardTitle>
            <CardDescription>
              {filteredData.length} itens listados na filial selecionada
            </CardDescription>
          </div>
          <Button onClick={() => { setEditingItem(undefined); setIsFormOpen(true); }} disabled={!selectedBranchId}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Item
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
             <div className="text-center py-8">Carregando estoque...</div>
          ) : !selectedBranchId ? (
             <div className="text-center py-8 text-muted-foreground">Selecione uma filial para ver o estoque.</div>
          ) : filteredData.length === 0 ? (
             <div className="text-center py-8 text-muted-foreground">Estoque vazio nesta filial.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Qtd. Atual</TableHead>
                    <TableHead className="text-center">Mínimo</TableHead>
                    <TableHead className="text-center">Preço Venda</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item) => {
                    const status = getStockStatus(item)
                    const StatusIcon = status.icon
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium">{item.produto.nome}</div>
                          <div className="text-xs text-muted-foreground">{item.produto.codigo_barras}</div>
                        </TableCell>
                        <TableCell className="text-center font-bold text-lg">{item.quantidade_atual}</TableCell>
                        <TableCell className="text-center text-muted-foreground">{item.quantidade_minima_estoque}</TableCell>
                        <TableCell className="text-center font-medium">R$ {item.preco_venda_atual}</TableCell>
                        <TableCell className="text-center">
                          <Badge className={cn("gap-1", status.className)} variant="outline">
                            <StatusIcon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Form */}
      <InventoryForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={fetchInventory}
        branchId={selectedBranchId}
        item={editingItem}
        onDelete={handleDelete}
      />
    </div>
  )
}
