"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { ProductSearch } from "@/components/checkout/product-search"
import { CartSummary } from "@/components/checkout/cart-summary"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Loader2 } from "lucide-react"

import type { CartItem, InventoryItem, Branch, SaleItem } from "@/lib/types"
import { createSale, addItemToSale, finalizeSale, removeItemFromSale, updateItemQuantityInSale } from "@/services/sales-service"
import { getBranches } from "@/services/branchService"

interface CartItemWithSaleId extends CartItem {
  saleItemId?: number
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItemWithSaleId[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoadingSale, setIsLoadingSale] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  const [lastSaleTime, setLastSaleTime] = useState<number>(Date.now())
  
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user?.branchId) {
      getBranches().then(branches => {
        const myBranch = branches.find(b => b.id.toString() === user.branchId?.toString())
        if(myBranch) setCurrentBranch(myBranch)
      })
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    const initSale = async () => {
      if (!user?.branchId || currentSaleId || initialized.current) return
      initialized.current = true
      setIsLoadingSale(true)
      try {
        const sale = await createSale(user.branchId)
        setCurrentSaleId(sale.id)
      } catch (error) {
        console.error(error)
        toast({ title: "Erro", description: "Falha ao iniciar caixa.", variant: "destructive" })
      } finally {
        setIsLoadingSale(false)
      }
    }
    initSale()
  }, [user, currentSaleId, toast])

  const addToCart = async (inventoryItem: InventoryItem, quantity = 1) => {
    if (!currentSaleId) return
    try {
      const itemVenda = await addItemToSale(currentSaleId, Number(inventoryItem.produto.id), quantity) as SaleItem
      setCartItems((prev) => {
        const newItem: CartItemWithSaleId = {
          productId: inventoryItem.produto.id.toString(),
          product: inventoryItem.produto,
          quantity: quantity,
          unitPrice: Number(inventoryItem.preco_venda_atual),
          subtotal: quantity * Number(inventoryItem.preco_venda_atual),
          saleItemId: itemVenda.id
        }
        const existingIndex = prev.findIndex(i => i.productId === newItem.productId)
        if (existingIndex >= 0) {
          const updated = [...prev]
          updated[existingIndex].quantity += quantity
          updated[existingIndex].subtotal += newItem.subtotal
          return updated
        }
        return [...prev, newItem]
      })
      toast({ title: "Adicionado", description: `${inventoryItem.produto.nome}` })
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      toast({ title: "Erro", description: error.response?.data?.detail || "Erro ao adicionar.", variant: "destructive" })
    }
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    const currentItem = cartItems.find(item => item.productId === productId)
    if (!currentItem || !currentSaleId || !currentItem.saleItemId) return

    if (newQuantity === 0) {
        removeItem(productId)
        return
    }
    try {
        await updateItemQuantityInSale(currentSaleId, currentItem.saleItemId, newQuantity)
        setCartItems(prev => prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
            : item
        ))
    } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } }
        toast({ title: "Erro", description: error.response?.data?.detail || "Estoque insuficiente.", variant: "destructive" })
    }
  }

  const removeItem = async (productId: string) => {
    const itemToRemove = cartItems.find(item => item.productId === productId)
    if (!itemToRemove || !currentSaleId || !itemToRemove.saleItemId) {
      setCartItems((prev) => prev.filter((item) => item.productId !== productId))
      return
    }
    try {
      await removeItemFromSale(currentSaleId, itemToRemove.saleItemId)
      setCartItems((prev) => prev.filter((item) => item.productId !== productId))
      toast({ title: "Removido", description: "Item removido da venda." })
    } catch (err: unknown) {
        toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" })
    }
  }

  const handleConfirmSale = async (paymentMethod: string) => {
    if (!currentSaleId) return
    try {
      const methodMap: Record<string, string> = { cash: "DINHEIRO", card: "CARTAO", pix: "PIX" }
      const backendMethod = methodMap[paymentMethod] || "DINHEIRO"

      await finalizeSale(currentSaleId, backendMethod)
      toast({ title: "Venda Finalizada!", description: "Estoque atualizado.", variant: "success" })

      setCartItems([])
      setCurrentSaleId(null)
      initialized.current = false
      setIsPaymentModalOpen(false)
      setLastSaleTime(Date.now()) 
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } }
      toast({ title: "Erro", description: error.response?.data?.detail || "Tente novamente.", variant: "destructive" })
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  if (!user || isLoadingSale) {
    return (
      <div className="flex h-screen items-center justify-center bg-app-gradient">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app-gradient flex flex-col overflow-hidden">
      <CheckoutHeader user={user} branch={currentBranch || undefined} />
      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-3/5 flex flex-col gap-4 overflow-y-auto">
          <Card className="border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold mb-2">Venda #{currentSaleId || "..."}</h2>
              <p className="text-muted-foreground">Adicione produtos para começar.</p>
            </CardContent>
          </Card>
          <ProductSearch 
            branchId={user.branchId?.toString()} 
            onAddToCart={addToCart}
            lastUpdate={lastSaleTime} 
          />
        </div>
        <div className="w-2/5">
          <CartSummary
            cartItems={cartItems}
            subtotal={subtotal}
            discount={0}
            total={subtotal}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onDiscountChange={() => {}}
          />
          {cartItems.length > 0 && (
             <div className="mt-4">
                 <Button className="w-full h-14 text-xl font-bold shadow-lg" onClick={() => setIsPaymentModalOpen(true)}>
                    <Receipt className="mr-2 h-6 w-6" /> Pagar R$ {subtotal.toFixed(2)}
                 </Button>
             </div>
          )}
        </div>
      </div>
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cartItems}
        total={subtotal}
        onConfirmSale={handleConfirmSale}
      />
    </div>
  )
}