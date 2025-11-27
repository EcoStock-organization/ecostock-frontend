"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import { getProductsWithCategories } from "@/lib/mock-data"
import type { ProductWithCategory } from "@/lib/types"

interface ProductSearchProps {
  onAddToCart: (product: ProductWithCategory, quantity: number) => void
}

export function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductWithCategory[]>([])

  const products = getProductsWithCategories()

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length >= 2) {
      const results = products.filter(
        (product) =>
          product.name.toLowerCase().includes(term.toLowerCase()) ||
          product.barcode.includes(term) ||
          product.category.name.toLowerCase().includes(term.toLowerCase()),
      )
      setSearchResults(results)
    } else {
      setSearchResults([])
    }
  }

  const handleAddProduct = (product: ProductWithCategory) => {
    onAddToCart(product, 1)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome, código de barras ou categoria..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 text-lg h-12"
        />
      </div>

      {searchResults.length > 0 && (
        <Card className="max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{product.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      {product.category.name}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{product.barcode}</p>
                  <p className="text-lg font-semibold text-primary">R$ {product.unitPrice.toFixed(2)}</p>
                </div>
                <Button onClick={() => handleAddProduct(product)} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
