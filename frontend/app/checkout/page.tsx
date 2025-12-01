"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { CheckoutHeader } from "@/components/checkout/checkout-header"
import { ProductSearch } from "@/components/sales/product-search" 
import { CartSummary } from "@/components/checkout/cart-summary"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CheckCircle2, ShoppingCart, ArrowRight } from "lucide-react"
import type { CartItem, Branch, SaleItem, ProductWithCategory } from "@/lib/types"
import { createSale, addItemToSale, finalizeSale, removeItemFromSale, updateItemQuantityInSale } from "@/services/sales-service"
import { getBranches } from "@/services/branchService"

interface CartItemWithSaleId extends CartItem {
    productId: string;
    product: ProductWithCategory;
    saleItemId?: number;
    unitPrice: number;
}

interface ProductWithStock extends ProductWithCategory {
    estoque_display?: number;
}

interface ApiError {
    response?: {
        data?: {
            detail?: string
        }
    }
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItemWithSaleId[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [lastChange, setLastChange] = useState(0)
  
  const [isLoadingSale, setIsLoadingSale] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  
  const initialized = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.branchId) {
      getBranches().then(branches => {
        const myBranch = branches.find(b => String(b.id) === String(user.branchId))
        if(myBranch) setCurrentBranch(myBranch)
      })
    }
  }, [isAuthenticated, user, router])

  const getOrCreateSaleId = async (): Promise<string | null> => {
    if (currentSaleId) return currentSaleId;
    
    if (!user?.branchId) {
        toast({ title: "Erro", description: "Operador sem filial vinculada.", variant: "destructive" })
        return null;
    }

    setIsLoadingSale(true)
    try {
        const sale = await createSale(user.branchId)
        setCurrentSaleId(sale.id)
        return sale.id
    } catch (err: unknown) {
        console.error(err)
        toast({ title: "Erro", description: "Não foi possível abrir a venda no sistema.", variant: "destructive" })
        return null
    } finally {
        setIsLoadingSale(false)
    }
  }

  const addToCart = async (product: ProductWithCategory, quantity = 1) => {
    const productWithStock = product as ProductWithStock
    const maxStock = productWithStock.estoque_display || 0
    const currentInCart = cartItems.find(i => i.productId === product.id.toString())?.quantity || 0
    
    if (currentInCart + quantity > maxStock) {
        toast({ 
            title: "Limite de Estoque", 
            description: `Você só possui ${maxStock} unidades deste item.`, 
            variant: "destructive" 
        })
        return
    }

    const saleId = await getOrCreateSaleId();
    if (!saleId) return;

    const unitPrice = product.preco_venda || 0;
    
    try {
      const itemVenda = await addItemToSale(saleId, Number(product.id), quantity) as SaleItem
      
      setCartItems((prev) => {
        const newItem: CartItemWithSaleId = {
          productId: product.id.toString(),
          product: { ...product, unitPrice },
          quantity: quantity,
          unitPrice: unitPrice,
          subtotal: quantity * unitPrice,
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

      toast({ title: "Item registrado", description: product.nome, duration: 1000 })
    } catch (err: unknown) {
      const error = err as ApiError
      const msg = error.response?.data?.detail || "Erro ao adicionar item."
      toast({ title: "Erro", description: msg, variant: "destructive" })
    }
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return
    const currentItem = cartItems.find(item => item.productId === productId)
    if (!currentItem || !currentSaleId || !currentItem.saleItemId) return

    const productWithStock = currentItem.product as ProductWithStock
    const maxStock = productWithStock.estoque_display || 9999
    if (newQuantity > maxStock) {
        toast({ 
            title: "Limite de Estoque", 
            description: `Estoque máximo disponível: ${maxStock}`, 
            variant: "destructive" 
        })
        return
    }

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
        const error = err as ApiError
        toast({ title: "Estoque insuficiente", description: error.response?.data?.detail, variant: "destructive" })
    }
  }

  const removeItem = async (productId: string) => {
    const itemToRemove = cartItems.find(item => item.productId === productId)
    if (!itemToRemove || !currentSaleId || !itemToRemove.saleItemId) return

    try {
      await removeItemFromSale(currentSaleId, itemToRemove.saleItemId)
      setCartItems((prev) => prev.filter((item) => item.productId !== productId))
    } catch (err: unknown) {
        const _ = err
        toast({ title: "Erro", description: "Não foi possível remover.", variant: "destructive" })
    }
  }

  const handleConfirmSale = async (paymentMethod: string, amountPaid?: number) => {
    if (!currentSaleId) return

    try {
      const methodMap: Record<string, string> = { cash: "DINHEIRO", card: "CARTAO", pix: "PIX" }
      const backendMethod = methodMap[paymentMethod] || "DINHEIRO"

      await finalizeSale(currentSaleId, backendMethod)
      
      const total = cartItems.reduce((acc, item) => acc + item.subtotal, 0)
      if (amountPaid && amountPaid > total) {
          setLastChange(amountPaid - total)
      } else {
          setLastChange(0)
      }

      setIsPaymentModalOpen(false)
      setIsSuccessModalOpen(true)
      
      setCartItems([])
      
    } catch (err: unknown) {
      const error = err as ApiError
      toast({ 
        title: "Erro ao finalizar", 
        description: error.response?.data?.detail || "Falha na baixa de estoque.", 
        variant: "destructive" 
      })
    }
  }

  const startNextSale = () => {
      setIsSuccessModalOpen(false)
      setCurrentSaleId(null)
      setLastChange(0)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  if (!user || isLoadingSale && !currentSaleId) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Iniciando caixa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <CheckoutHeader user={user} branch={currentBranch || undefined} />

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        <div className="w-3/5 flex flex-col gap-4 overflow-y-auto pr-2">
          <Card className="border-l-4 border-l-primary shadow-sm">
            <CardContent className="pt-6 pb-6 flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-foreground">
                        {currentSaleId ? "Venda em Curso" : "Caixa Livre"}
                    </h2>
                    <p className="text-muted-foreground">
                        {currentSaleId ? "Adicione mais itens ou finalize" : "Inicie uma nova venda"}
                    </p>
                </div>
                <ShoppingCart className={`h-8 w-8 ${currentSaleId ? "text-primary" : "text-muted"} opacity-20`} />
            </CardContent>
          </Card>
          
          <ProductSearch 
            branchId={user.branchId?.toString()} 
            cartItems={cartItems}
            onAddToCart={addToCart}
          />
        </div>

        <div className="w-2/5 flex flex-col">
          <div className="flex-1 overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">
              <CartSummary
                cartItems={cartItems}
                subtotal={subtotal}
                discount={0}
                total={subtotal}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeItem}
                onDiscountChange={() => {}}
              />
          </div>
          
          <div className="mt-4">
             <Button 
                className="w-full h-16 shadow-lg bg-green-600 hover:bg-green-700 text-white relative" 
                size="lg"
                disabled={cartItems.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
             >
                <span className="text-xl font-bold tracking-wide">FINALIZAR VENDA</span>
                <ArrowRight className="absolute right-6 h-6 w-6 opacity-70" />
             </Button>
          </div>
        </div>
      </div>
      
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cartItems}
        total={subtotal}
        onConfirmSale={handleConfirmSale}
      />

      <Dialog open={isSuccessModalOpen} onOpenChange={(open) => { if(!open) startNextSale() }}>
        <DialogContent className="sm:max-w-md text-center">
            <DialogHeader>
                <div className="mx-auto mb-4 bg-green-100 p-3 rounded-full w-fit">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
                <DialogTitle className="text-2xl text-center text-green-700">Venda Realizada!</DialogTitle>
            </DialogHeader>
            
            <div className="py-6 space-y-2">
                <p className="text-muted-foreground">A venda foi registrada e o estoque atualizado.</p>
                {lastChange > 0 && (
                    <div className="bg-muted p-4 rounded-lg mt-4">
                        <p className="text-sm font-semibold text-muted-foreground uppercase">Troco</p>
                        <p className="text-3xl font-bold text-foreground">R$ {lastChange.toFixed(2)}</p>
                    </div>
                )}
            </div>

            <DialogFooter className="sm:justify-center">
                <Button onClick={startNextSale} size="lg" className="w-full bg-green-600 hover:bg-green-700">
                    Nova Venda (Próximo Cliente)
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}