// frontend/app/sales/page.tsx
"use client"

import { useState, useEffect, useRef } from "react" // Adicionado useRef, useEffect
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductSearch } from "@/components/sales/product-search"
import { ShoppingCartComponent, type CartItem } from "@/components/sales/shopping-cart"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Loader2 } from "lucide-react" // Adicionado Loader2
import type { ProductWithCategory } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context" // Adicionado useAuth
import { createSale, addItemToSale, finalizeSale } from "@/services/sales-service" // Adicionado API Services

export default function SalesPage() {
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isPaymentModalOpen, setIsPaymentModal] = useState(false)
  const { toast } = useToast()

  // API States
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [isLoadingSale, setIsLoadingSale] = useState(true)
  const initialized = useRef(false) 

  // 1. Init Sale Logic (on mount)
  useEffect(() => {
      const initSale = async () => {
          if (!user?.id || currentSaleId || initialized.current) return
          
          initialized.current = true // Lock
          setIsLoadingSale(true)

          try {
              // Esta página é usada por Admins/Gerentes. Usamos o branchId do usuário ou default para 1.
              const branchId = user?.branchId || 1 
              
              const sale = await createSale(branchId)
              setCurrentSaleId(sale.id)
          } catch (error) {
              console.error("Erro ao iniciar venda:", error)
              toast({ title: "Erro", description: "Falha ao iniciar sistema de vendas.", variant: "destructive" })
          } finally {
              setIsLoadingSale(false)
          }
      }
      initSale()
  }, [user, currentSaleId, toast])
  
  // 2. Add to Cart (API Call)
  const addToCart = async (product: ProductWithCategory, quantity: number) => {
    if (!currentSaleId) {
        toast({ title: "Aviso", description: "Venda não iniciada.", variant: "destructive" });
        return;
    }
    
    // O preço de venda vem de 'preco_venda'. Usamos este valor para o cálculo e para a UI.
    const unitPrice = product.preco_venda || 0; 
    
    // CORREÇÃO: Cria um objeto de produto seguro para o carrinho (ShoppingCartComponent)
    const safeProduct = {
        ...product,
        // Adicionamos unitPrice ao objeto product para satisfazer o ShoppingCartComponent
        unitPrice: unitPrice 
    }
    
    try {
        // Esta chamada API adiciona o item e valida o estoque.
        await addItemToSale(currentSaleId, Number(product.id), quantity)

        // Atualiza UI local
        setCartItems((prev) => {
            const existingIndex = prev.findIndex(i => i.product.id === product.id)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex].quantity += quantity
                updated[existingIndex].subtotal += (quantity * unitPrice)
                return updated
            }
            return [...prev, {
                // USAMOS safeProduct, que possui unitPrice
                product: safeProduct, 
                quantity: quantity,
                unitPrice: unitPrice,
                subtotal: quantity * unitPrice
            }]
        })
        
        toast({ title: "Adicionado", description: `${product.nome}` })
    } catch (err: unknown) {
        const error = err as { response?: { data?: { detail?: string } } }
        const msg = error.response?.data?.detail || "Erro ao adicionar item."
        toast({ title: "Erro", description: msg, variant: "destructive" })
    }
  }

  // 3. Funções de manipulação local (mantidas como alerta para não complicar o MVP)
  const updateQuantity = (productId: string, quantity: number) => {
    toast({ title: "Aviso", description: "Ajuste de quantidade manual não implementado. Use o Checkout.", variant: "warning" });
  }

  const removeItem = (productId: string) => {
    toast({ title: "Aviso", description: "Remoção de item não implementada. Use o Checkout.", variant: "warning" });
  }

  const clearCart = () => {
    setCartItems([])
  }


  // 4. Finalize Sale (API Call que dispara a baixa de estoque)
  const handleConfirmSale = async (paymentMethod: string, amountPaid?: number) => {
    if (!currentSaleId) return

    try {
        const methodMap: Record<string, string> = { cash: "DINHEIRO", card: "CARTAO", pix: "PIX" }
        const backendMethod = methodMap[paymentMethod] || "DINHEIRO"

        // ESTA É A CHAMADA QUE DISPARA A BAIXA DE ESTOQUE NO BACKEND
        await finalizeSale(currentSaleId, backendMethod) 
        
        toast({
            title: "Venda Finalizada!",
            description: `Venda #${currentSaleId} concluída. O estoque foi baixado.`,
            variant: "success"
        })

        // Reset state
        setCartItems([])
        setCurrentSaleId(null)
        initialized.current = false 

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
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Vendas</h1>
          <p className="text-muted-foreground">Venda #{currentSaleId} | {user?.branchId ? `Filial ${user.branchId}` : 'Administrador'}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Product Search */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Produtos</CardTitle>
                <CardDescription>Busca global de produtos por nome ou código</CardDescription>
              </CardHeader>
              <CardContent>
                {/* ProductSearch chama addToCart */}
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
                  <Button onClick={() => setIsPaymentModal(true)} className="w-full h-12 text-lg" size="lg">
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
          onClose={() => setIsPaymentModal(false)}
          items={cartItems}
          total={total}
          onConfirmSale={handleConfirmSale} // Chama a função que faz a API call real
        />
      </div>
    </DashboardLayout>
  )
}