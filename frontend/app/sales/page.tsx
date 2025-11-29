"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductSearch } from "@/components/sales/product-search"
import { ShoppingCartComponent, type CartItem } from "@/components/sales/shopping-cart"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Loader2 } from "lucide-react"
import type { ProductWithCategory, SaleItem } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { createSale, addItemToSale, finalizeSale, removeItemFromSale, updateItemQuantityInSale } from "@/services/sales-service"

interface CartItemWithSaleId extends CartItem {
    saleItemId?: number;
}

export default function SalesPage() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItemWithSaleId[]>([])
  const [isPaymentModalOpen, setIsPaymentModal] = useState(false)
  const { toast } = useToast()

  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [isLoadingSale, setIsLoadingSale] = useState(true)
  const initialized = useRef(false) 

  // 1. Init Sale Logic
  useEffect(() => {
      const initSale = async () => {
          if (!user?.id || currentSaleId || initialized.current) return
          
          initialized.current = true
          setIsLoadingSale(true)

          try {
              const branchId = user?.branchId || 1 
              const sale = await createSale(branchId)
              setCurrentSaleId(sale.id)
          } catch (error) {
              console.error("Erro ao iniciar venda:", error)
              toast({ title: "Erro", description: "Falha ao iniciar sistema.", variant: "destructive" })
          } finally {
              setIsLoadingSale(false)
          }
      }
      initSale()
  }, [user, currentSaleId, toast])
  
  // 2. Add to Cart
  const addToCart = async (product: ProductWithCategory, quantity: number) => {
    if (!currentSaleId) {
        toast({ title: "Aviso", description: "Venda não iniciada.", variant: "destructive" });
        return;
    }
    
    const unitPrice = product.preco_venda || 0; 
    
    const safeProduct = {
        ...product,
        unitPrice: unitPrice 
    }
    
    try {
        const itemVenda = await addItemToSale(currentSaleId, Number(product.id), quantity) as SaleItem

        setCartItems((prev) => {
            const existingIndex = prev.findIndex(i => i.product.id === product.id)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex].quantity += quantity
                updated[existingIndex].subtotal += (quantity * unitPrice)
                return updated
            }
            return [...prev, {
                product: safeProduct, 
                quantity: quantity,
                unitPrice: unitPrice,
                subtotal: quantity * unitPrice,
                saleItemId: itemVenda.id
            }]
        })
        
        toast({ title: "Adicionado", description: `${product.nome}` })
    } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } }
        const msg = error.response?.data?.detail || "Erro ao adicionar item."
        toast({ title: "Erro", description: msg, variant: "destructive" })
    }
  }

  // 3. Update Quantity (IMPLEMENTADO CORRETAMENTE)
  const updateQuantity = async (productId: string, quantity: number) => {
    const currentItem = cartItems.find(item => item.product.id === productId)
    if (!currentItem || !currentSaleId || !currentItem.saleItemId) return

    // Se 0, remove
    if (quantity === 0) {
        removeItem(productId)
        return
    }

    try {
        // Chama API PATCH
        await updateItemQuantityInSale(currentSaleId, currentItem.saleItemId, quantity)

        setCartItems(prev => prev.map(item => {
            if (item.product.id === productId) {
                return {
                    ...item,
                    quantity,
                    subtotal: quantity * item.unitPrice
                }
            }
            return item
        }))

    } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } }
        toast({ 
            title: "Erro", 
            description: error.response?.data?.detail || "Não foi possível ajustar a quantidade.", 
            variant: "destructive" 
        })
    }
  }

  // 4. Remove Item (IMPLEMENTADO CORRETAMENTE)
  const removeItem = async (productId: string) => {
    const itemToRemove = cartItems.find(item => item.product.id === productId)
    
    if (!itemToRemove || !currentSaleId || !itemToRemove.saleItemId) {
        setCartItems(prev => prev.filter(item => item.product.id !== productId))
        return
    }

    try {
        await removeItemFromSale(currentSaleId, itemToRemove.saleItemId)
        setCartItems(prev => prev.filter(item => item.product.id !== productId))
        toast({ title: "Removido", description: "Item removido da venda." })
    } catch (err: unknown) {
        toast({ title: "Erro", description: "Erro ao remover item.", variant: "destructive" })
    }
  }

  const clearCart = () => {
    setCartItems([])
  }

  const handleConfirmSale = async (paymentMethod: string, amountPaid?: number) => {
    if (!currentSaleId) return

    try {
        const methodMap: Record<string, string> = { cash: "DINHEIRO", card: "CARTAO", pix: "PIX" }
        const backendMethod = methodMap[paymentMethod] || "DINHEIRO"

        await finalizeSale(currentSaleId, backendMethod) 
        
        toast({
            title: "Venda Finalizada!",
            description: `Venda #${currentSaleId} concluída. Estoque baixado.`,
            variant: "success"
        })

        setCartItems([])
        setCurrentSaleId(null)
        initialized.current = false 
        setIsPaymentModal(false)

    } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } }
        toast({ 
            title: "Erro ao finalizar", 
            description: error.response?.data?.detail || "Tente novamente. Baixa de estoque pode ter falhado.", 
            variant: "destructive" 
        })
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  if (isLoadingSale || !currentSaleId) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Iniciando Venda...</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Vendas</h1>
          <p className="text-muted-foreground">Venda #{currentSaleId} | {user?.branchId ? `Filial ${user.branchId}` : 'Administrador'}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Produtos</CardTitle>
                <CardDescription>Busca global de produtos por nome ou código</CardDescription>
              </CardHeader>
              <CardContent>
                <ProductSearch onAddToCart={addToCart} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ShoppingCartComponent
              items={cartItems}
              // Adaptadores de ID (Sales usa product.id, ShoppingCart espera ID para callback)
              onUpdateQuantity={(id, qtd) => updateQuantity(id, qtd)} 
              onRemoveItem={(id) => removeItem(id)}
              onClearCart={clearCart}
            />

            {cartItems.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={() => setIsPaymentModal(true)} className="w-full h-12 text-lg" size="lg">
                    <Receipt className="h-5 w-5 mr-2" />
                    Finalizar Venda - R$ {total.toFixed(2)}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModal(false)}
          items={cartItems}
          total={total}
          onConfirmSale={handleConfirmSale}
        />
      </div>
    </DashboardLayout>
  )
}