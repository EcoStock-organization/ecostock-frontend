"use client"

import { useState, useEffect, useMemo } from "react"
import { Search, Plus, Package } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { InventoryItem } from "@/lib/types"
import { getBranchStock } from "@/services/stock-service"

interface ProductSearchProps {
  branchId?: string
  onAddToCart: (item: InventoryItem, quantity: number) => void
  lastUpdate?: number
}

export function ProductSearch({ branchId, onAddToCart, lastUpdate }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [stockItems, setStockItems] = useState<InventoryItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (branchId) {
      getBranchStock(branchId)
        .then(setStockItems)
        .catch(console.error)
    }
  }, [branchId, lastUpdate])

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return []
    const query = searchTerm.toLowerCase()
    
    return stockItems
      .filter((item) => {
        const hasStock = item.quantidade_atual > 0
        const matchesName = item.produto.nome.toLowerCase().includes(query)
        const matchesCode = item.produto.codigo_barras.includes(query)
        return hasStock && (matchesName || matchesCode)
      })
      .slice(0, 10)
  }, [searchTerm, stockItems])

  const handleAddItem = (item: InventoryItem) => {
    onAddToCart(item, 1)
    setSearchTerm("")
    setIsOpen(false)
  }

  return (
    <div className="space-y-4 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto (nome ou código)..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="pl-10 text-lg h-12"
          disabled={!branchId}
        />
      </div>

      {isOpen && filteredItems.length > 0 && (
        <Card className="absolute w-full z-50 max-h-96 overflow-y-auto shadow-xl border-primary/20">
          <CardContent className="p-0">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{item.produto.nome}</h3>
                    {item.produto.categoria_nome && (
                      <Badge variant="outline" className="text-xs">
                        {item.produto.categoria_nome}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm">
                     <span className="text-muted-foreground font-mono">
                        {item.produto.codigo_barras}
                     </span>
                     {/* Mostra estoque atualizado em tempo real */}
                     <span className={`font-medium ${item.quantidade_atual < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        Estoque: {item.quantidade_atual}
                     </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <p className="text-lg font-bold text-primary">
                        R$ {Number(item.preco_venda_atual).toFixed(2)}
                    </p>
                    <Button onClick={() => handleAddItem(item)} size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}