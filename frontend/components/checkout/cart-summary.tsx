"use client"

import { Trash2, Plus, Minus } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface CartSummaryProps {
  cartItems: CartItem[]
  subtotal: number
  discount: number
  total: number
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onDiscountChange: (discount: number) => void
}

export function CartSummary({
  cartItems,
  subtotal,
  discount,
  total,
  onUpdateQuantity,
  onRemoveItem,
}: CartSummaryProps) {

  return (
    <div className="h-full bg-card rounded-xl p-4 flex flex-col overflow-hidden">
      {/* Lista de Itens */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-2">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.productId} className="bg-muted/50 rounded-lg p-3 space-y-2 border border-border">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-foreground line-clamp-2">
                    {item.product.nome || item.product.nome || "Produto sem nome"}
                </p>
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="text-destructive hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-background rounded border transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-background rounded border transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <p className="text-sm font-bold text-foreground">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50">
            <p className="text-center">Carrinho vazio</p>
          </div>
        )}
      </div>

      <div className="pt-4 space-y-4">
        {/* Totais */}
        <div className="space-y-2">
          <div className="flex justify-between items-end pt-2 border-t">
            <span className="font-bold text-lg text-primary">Total:</span>
            <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}