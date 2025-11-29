"use client"

import { useState } from "react"
import { Trash2, Plus, Minus, CreditCard, Banknote, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  onDiscountChange,
}: CartSummaryProps) {
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

  const handleFinalizeSale = () => {
    if (paymentMethod) {
      alert(`Venda finalizada com ${paymentMethod}`)
    }
  }

  return (
    <div className="h-full bg-card rounded-xl shadow-sm border border-status-success/30 p-4 flex flex-col overflow-hidden">
      {/* Items List */}
      <div className="flex-1 overflow-y-auto mb-4 pr-2 space-y-2">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.productId} className="bg-muted rounded-lg p-3 space-y-2 border border-status-warning">
              <div className="flex justify-between items-start">
                <p className="text-sm font-semibold text-foreground">{item.product.name}</p>
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="text-status-critical hover:text-status-critical transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-status-success/20 rounded transition-colors"
                  >
                    <Minus className="w-4 h-4 text-status-success" />
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => onUpdateQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                    className="w-10 h-8 text-center border border-status-success/30 rounded text-sm font-semibold"
                  />
                  <button
                    onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-status-success/20 rounded transition-colors"
                  >
                    <Plus className="w-4 h-4 text-status-success" />
                  </button>
                </div>
                <p className="text-sm font-bold text-status-success">R$ {(item.quantity * item.unitPrice).toFixed(2)}</p>
              </div>

              <div className="text-xs text-muted-foreground">
                {item.quantity} x R$ {item.unitPrice.toFixed(2)}
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-center">Nenhum item no carrinho</p>
          </div>
        )}
      </div>

      <div className="border-t border-status-success/30 pt-4 space-y-3">
        {/* Discount */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-foreground">Desconto (R$)</label>
          <Input
            type="number"
            value={discount}
            onChange={(e) => onDiscountChange(Math.max(0, Number.parseFloat(e.target.value) || 0))}
            className="border-status-success/30 text-foreground placeholder-muted-foreground"
            placeholder="0.00"
            min="0"
            step="0.01"
          />
        </div>

        {/* Totals */}
          <div className="space-y-2 bg-status-success/10 rounded-lg p-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span className="text-foreground">R$ {subtotal.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Desconto:</span>
              <span className="text-status-critical">-R$ {discount.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-status-success/30 pt-4 flex justify-between">
            <span className="font-bold text-status-success">Total:</span>
            <span className="text-2xl font-bold text-status-success">R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-foreground">Método de pagamento:</p>
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => setPaymentMethod("cash")}
              variant={paymentMethod === "cash" ? "default" : "outline"}
              className={`gap-2 h-12 font-semibold ${
                paymentMethod === "cash"
                  ? "bg-pay-cash text-white hover:bg-pay-cash-10"
                  : "border-status-success/30 text-status-success hover:bg-status-success/10"
              }`}
            >
              <Banknote className="w-4 h-4" />
              Dinheiro
            </Button>
            <Button
              onClick={() => setPaymentMethod("card")}
              variant={paymentMethod === "card" ? "default" : "outline"}
              className={`gap-2 h-12 font-semibold ${
                paymentMethod === "card"
                  ? "bg-pay-card text-white hover:bg-pay-card-10"
                  : "border-status-success/30 text-status-success hover:bg-status-success/10"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Cartão
            </Button>
            <Button
              onClick={() => setPaymentMethod("pix")}
              variant={paymentMethod === "pix" ? "default" : "outline"}
              className={`gap-2 h-12 font-semibold ${
                paymentMethod === "pix"
                  ? "bg-pay-pix text-white hover:bg-pay-pix-10"
                  : "border-status-success/30 text-status-success hover:bg-status-success/10"
              }`}
            >
              <QrCode className="w-4 h-4" />
              Pix
            </Button>
          </div>
        </div>

        {/* Finalize Button */}
        <Button
          onClick={handleFinalizeSale}
          disabled={cartItems.length === 0 || !paymentMethod}
          className="w-full h-14 bg-pay-cash text-white font-bold text-lg rounded-lg hover:bg-pay-cash-10 disabled:bg-muted disabled:text-muted-foreground transition-all"
        >
          FINALIZAR VENDA
        </Button>
      </div>
    </div>
  )
}
