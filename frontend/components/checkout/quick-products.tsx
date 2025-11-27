"use client"

import { Plus } from "lucide-react"
import type { Product } from "@/lib/types"

interface QuickProductsProps {
  products: Product[]
  onAddToCart: (product: Product, quantity: number) => void
  searchQuery: string
}

export function QuickProducts({ products, onAddToCart, searchQuery }: QuickProductsProps) {
  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.barcode.includes(searchQuery),
  )

  return (
    <div className="flex-1 bg-card rounded-xl shadow-sm border border-status-success/30 p-4 overflow-y-auto">
      <h3 className="text-sm font-semibold text-foreground mb-4 font-display">
        {searchQuery ? "Produtos encontrados" : "Produtos rápidos"}
      </h3>
      <div className="grid grid-cols-3 gap-3 auto-rows-max">
        {filtered.length > 0 ? (
          filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => onAddToCart(product, 1)}
              className="p-3 bg-gradient-to-br from-muted to-muted border-2 border-status-warning rounded-lg hover:shadow-md hover:border-status-success transition-all group"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground group-hover:text-status-success transition-colors line-clamp-2">
                  {product.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{product.barcode.slice(-4)}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-base font-bold text-status-success">R$ {product.unitPrice.toFixed(2)}</p>
                  <Plus className="w-4 h-4 text-status-success group-hover:w-5 group-hover:h-5 transition-all" />
                </div>
              </div>
            </button>
          ))
        ) : (
          <p className="col-span-3 text-center text-muted-foreground text-sm py-8">Nenhum produto encontrado</p>
        )}
      </div>
    </div>
  )
}
