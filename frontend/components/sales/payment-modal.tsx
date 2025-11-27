"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Banknote, Smartphone, Check } from "lucide-react"
import type { CartItem } from "./shopping-cart"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  onConfirmSale: (paymentMethod: string, amountPaid?: number) => void
}

export function PaymentModal({ isOpen, onClose, items, total, onConfirmSale }: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [amountPaid, setAmountPaid] = useState<string>(total.toFixed(2))
  const [isProcessing, setIsProcessing] = useState(false)

  const change = Number.parseFloat(amountPaid) - total
  const canComplete = paymentMethod === "card" || paymentMethod === "pix" || change >= 0

  const handleConfirmSale = async () => {
    if (!canComplete) return

    setIsProcessing(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    onConfirmSale(paymentMethod, paymentMethod === "cash" ? Number.parseFloat(amountPaid) : undefined)
    setIsProcessing(false)
    onClose()
  }

  const paymentMethods = [
    {
      id: "cash",
      label: "Dinheiro",
      icon: Banknote,
      description: "Pagamento em espécie",
    },
    {
      id: "card",
      label: "Cartão",
      icon: CreditCard,
      description: "Débito ou crédito",
    },
    {
      id: "pix",
      label: "PIX",
      icon: Smartphone,
      description: "Transferência instantânea",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Finalizar Venda</DialogTitle>
          <DialogDescription>Selecione a forma de pagamento e confirme a transação</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {items.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>
                      {item.quantity}x {item.product.name}
                    </span>
                    <span>R$ {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Forma de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <method.icon className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <Label htmlFor={method.id} className="font-medium cursor-pointer">
                        {method.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">{method.description}</p>
                    </div>
                  </div>
                ))}
              </RadioGroup>

              {paymentMethod === "cash" && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="amount-paid">Valor Recebido</Label>
                    <Input
                      id="amount-paid"
                      type="number"
                      step="0.01"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="text-lg"
                    />
                  </div>
                  {change >= 0 && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex justify-between font-medium">
                        <span>Troco:</span>
                        <span className="text-lg">R$ {change.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  {change < 0 && <p className="text-sm text-destructive">Valor insuficiente para completar a venda</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmSale} disabled={!canComplete || isProcessing} className="min-w-32">
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                Processando...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Confirmar Venda
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
