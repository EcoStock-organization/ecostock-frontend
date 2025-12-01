"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react"
import type { CartItem } from "@/lib/types"

interface ShoppingCartProps {
  items: CartItem[]
  onUpdateQuantity: (productId: string, quantity: number) => void
  onRemoveItem: (productId: string) => void
  onClearCart: () => void
}

export function ShoppingCartComponent({ items, onUpdateQuantity, onRemoveItem, onClearCart }: ShoppingCartProps) {
  const total = items.reduce((sum, item) => sum + item.subtotal, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Carrinho ({totalItems})
        </CardTitle>
        {items.length > 0 && (
          <Button variant="outline" size="sm" onClick={onClearCart}>
            Limpar
          </Button>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden flex flex-col gap-4">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
            <ShoppingCart className="h-12 w-12 mb-2" />
            <p>Carrinho vazio</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {items.map((item) => (
                <div key={item.productId} className="flex items-start gap-3 p-3 bg-muted/40 border border-border rounded-lg">
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium text-sm text-foreground line-clamp-2">
                        {item.product.nome || item.product.nome || "Produto"}
                    </h4>
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                        <span>Unit: R$ {item.unitPrice.toFixed(2)}</span>
                        <span className="font-mono">Sub: R$ {item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:bg-destructive/10"
                        onClick={() => onRemoveItem(item.productId)}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1 bg-background rounded-md border shadow-sm">
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
                        >
                        <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                            onUpdateQuantity(item.productId, Math.max(0, Number.parseInt(e.target.value) || 0))
                        }
                        className="w-10 h-7 text-center border-0 p-0 text-xs focus-visible:ring-0"
                        min="0"
                        />
                        <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-none"
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        >
                        <Plus className="h-3 w-3" />
                        </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            <div className="pt-2">
              <div className="flex justify-between items-end">
                <span className="text-muted-foreground font-medium">Total Geral</span>
                <span className="text-2xl font-bold text-primary">R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}