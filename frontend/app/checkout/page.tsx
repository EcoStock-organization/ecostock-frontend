"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { ProductSearch } from "@/components/checkout/product-search"
import { CartSummary } from "@/components/checkout/cart-summary"
import { mockBranches } from "@/lib/mock-data"
import type { CartItem, Product } from "@/lib/types"

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [discount, setDiscount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "operator") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  if (!user) return null

  const branch = mockBranches.find((b) => b.id === user.branchId)

  const addToCart = (product: Product, quantity = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + quantity } : item,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          product,
          quantity,
          unitPrice: product.unitPrice,
        },
      ]
    })
  }

  const handleProductSelect = (product: Product) => {
    addToCart(product, 1)
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
  const total = subtotal - discount

  return (
    <div className="min-h-screen bg-app-gradient flex flex-col overflow-hidden">
      {/* Header */}
      <CheckoutHeader user={user} branch={branch} />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Left Column - Search only, no quick products */}
        <div className="w-3/5 flex flex-col gap-4 overflow-y-auto">
          <ProductSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectProduct={handleProductSelect}
          />
        </div>

        {/* Right Column - Cart Summary */}
        <div className="w-2/5">
          <CartSummary
            cartItems={cartItems}
            subtotal={subtotal}
            discount={discount}
            total={total}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCart}
            onDiscountChange={setDiscount}
          />
        </div>
      </div>
    </div>
  )
}
