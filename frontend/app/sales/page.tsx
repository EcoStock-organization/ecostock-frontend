"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductSearch } from "@/components/sales/product-search"
import { ShoppingCartComponent, type CartItem } from "@/components/sales/shopping-cart"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Receipt } from "lucide-react"
import type { ProductWithCategory } from "@/lib/types"

export default function SalesPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const { toast } = useToast()

  const addToCart = (product: ProductWithCategory, quantity: number) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.product.id === product.id)

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + quantity,
                subtotal: (item.quantity + quantity) * product.unitPrice,
              }
            : item,
        )
      }

      return [
        ...prev,
        {
          product,
          quantity,
          subtotal: quantity * product.unitPrice,
        },
      ]
    })

    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho`,
    })
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeItem(productId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              quantity,
              subtotal: quantity * item.product.unitPrice,
            }
          : item,
      ),
    )
  }

  const removeItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const handleConfirmSale = (paymentMethod: string, amountPaid?: number) => {
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

    // Here you would typically save the sale to the database
    console.log("Sale confirmed:", {
      items: cartItems,
      total,
      paymentMethod,
      amountPaid,
      timestamp: new Date(),
    })

    toast({
      title: "Venda realizada com sucesso!",
      description: `Total: R$ ${total.toFixed(2)} - Pagamento: ${paymentMethod}`,
    })

    clearCart()
  }

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Vendas</h1>
          <p className="text-muted-foreground">Registre vendas e gerencie transações</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Search */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Produtos</CardTitle>
                <CardDescription>Digite o nome, código de barras ou categoria do produto</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSearch onAddToCart={addToCart} />
              </CardContent>
            </Card>
          </div>

          {/* Shopping Cart */}
          <div className="space-y-6">
            <ShoppingCartComponent
              items={cartItems}
              onUpdateQuantity={updateQuantity}
              onRemoveItem={removeItem}
              onClearCart={clearCart}
            />

            {cartItems.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={() => setIsPaymentModalOpen(true)} className="w-full h-12 text-lg" size="lg">
                    <Receipt className="h-5 w-5 mr-2" />
                    Finalizar Venda - R$ {total.toFixed(2)}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Payment Modal */}
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          items={cartItems}
          total={total}
          onConfirmSale={handleConfirmSale}
        />
      </div>
    </DashboardLayout>
  )
}
