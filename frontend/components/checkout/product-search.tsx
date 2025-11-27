"use client"

import { useState, useMemo } from "react"
import { Search, Check } from "lucide-react"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/lib/types"

interface ProductSearchProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSelectProduct?: (product: Product) => void
}

export function ProductSearch({ searchQuery, setSearchQuery, onSelectProduct }: ProductSearchProps) {
  const [isOpen, setIsOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return mockProducts
      .filter((p) => p.name.toLowerCase().includes(query) || (p.barcode && p.barcode.toLowerCase().includes(query)))
      .slice(0, 8)
  }, [searchQuery])

  const handleSelectProduct = (product: Product) => {
    if (onSelectProduct) {
      onSelectProduct(product)
    }
    setSearchQuery("")
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
        <Search className="w-5 h-5" />
      </div>
      <input
        type="text"
        placeholder="Buscar por código de barras ou nome do produto"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => searchQuery && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-full pl-10 pr-4 py-3 text-lg bg-card border-2 border-status-success/30 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:border-status-success focus:ring-2 focus:ring-status-success transition-all"
      />

      {isOpen && filteredProducts.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-status-success/30 rounded-xl shadow-lg z-10 overflow-hidden">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelectProduct(product)}
              className="w-full px-4 py-3 text-left hover:bg-status-success/10 transition-colors border-b border-status-success/30 last:border-b-0 flex items-center justify-between group"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">{product.name}</p>
                <p className="text-xs text-muted-foreground">Código: {product.barcode}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-status-success">R$ {product.unitPrice.toFixed(2)}</p>
                <Check className="w-4 h-4 text-status-success opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
