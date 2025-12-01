"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductSearch } from "@/components/sales/product-search"
import { ShoppingCartComponent } from "@/components/sales/shopping-cart"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, ArrowRight, ShoppingCart } from "lucide-react" // Removed Receipt
import type { ProductWithCategory, SaleItem, Branch, CartItem } from "@/lib/types"
import { useAuth } from "@/contexts/auth-context"
import { createSale, addItemToSale, finalizeSale, removeItemFromSale, updateItemQuantityInSale } from "@/services/sales-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBranches } from "@/services/branchService"

interface CartItemWithSaleId extends CartItem {
    productId: string;
    product: ProductWithCategory;
    saleItemId?: number;
    unitPrice: number;
}

interface AxiosError {
    response?: {
        data?: {
            detail?: string
        }
    }
}

interface ProductWithStock extends ProductWithCategory {
    estoque_display?: number;
}

export default function SalesPage() {
  const { user } = useAuth()
  
  const [cartItems, setCartItems] = useState<CartItemWithSaleId[]>([])
  const [isPaymentModalOpen, setIsPaymentModal] = useState(false)
  const { toast } = useToast()

  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")

  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [isLoadingSale, setIsLoadingSale] = useState(false)
  
  const initializedSale = useRef(false)

  useEffect(() => {
    const loadContext = async () => {
      if (!user) return

      if (user.role === 'admin') {
        try {
          const data = await getBranches()
          setBranches(data)
        } catch (error) {
          console.error("Erro ao carregar filiais", error)
        }
      } else if (user.branchId) {
        setSelectedBranchId(user.branchId.toString())
      }
    }
    loadContext()
  }, [user])

  const getOrCreateSaleId = async (): Promise<string | null> => {
    if (currentSaleId) return currentSaleId;
    
    if (!selectedBranchId) {
        toast({ title: "Atenção", description: "Selecione uma filial para iniciar a venda.", variant: "warning" })
        return null;
    }

    setIsLoadingSale(true)
    initializedSale.current = true 
    try {
        const sale = await createSale(selectedBranchId)
        setCurrentSaleId(sale.id)
        return sale.id
    } catch (error) {
        console.error(error)
        toast({ title: "Erro", description: "Não foi possível abrir a venda.", variant: "destructive" })
        return null
    } finally {
        setIsLoadingSale(false)
    }
  }

  const handleBranchChange = (newBranchId: string) => {
      if (cartItems.length > 0) {
          if(!confirm("Mudar de filial limpará o carrinho atual. Continuar?")) return
      }
      setCartItems([])
      setCurrentSaleId(null)
      setSelectedBranchId(newBranchId)
  }
  
  const addToCart = async (product: ProductWithCategory, quantity: number) => {
    const productWithStock = product as ProductWithStock
    const maxStock = productWithStock.estoque_display || 0
    const currentInCart = cartItems.find(i => i.productId === product.id.toString())?.quantity || 0
    
    if (maxStock > 0 && (currentInCart + quantity > maxStock)) {
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
    const safeProduct: ProductWithCategory = { ...product, unitPrice: unitPrice }
    
    try {
        const itemVenda = await addItemToSale(saleId, Number(product.id), quantity) as SaleItem

        setCartItems((prev) => {
            const existingIndex = prev.findIndex(i => i.product.id === product.id)
            if (existingIndex >= 0) {
                const updated = [...prev]
                updated[existingIndex].quantity += quantity
                updated[existingIndex].subtotal += (quantity * unitPrice)
                return updated
            }
            return [...prev, {
                productId: product.id.toString(),
                product: safeProduct, 
                quantity: quantity,
                unitPrice: unitPrice,
                subtotal: quantity * unitPrice,
                saleItemId: itemVenda.id
            }]
        })
        
        toast({ title: "Adicionado", description: `${product.nome}` })
    } catch (err: unknown) {
        const error = err as AxiosError
        const msg = error.response?.data?.detail || "Erro ao adicionar item."
        toast({ title: "Erro", description: msg, variant: "destructive" })
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    const currentItem = cartItems.find(item => String(item.product.id) === String(productId))
    if (!currentItem || !currentSaleId || !currentItem.saleItemId) return

    const productWithStock = currentItem.product as ProductWithStock
    const maxStock = productWithStock.estoque_display || 9999

    if (quantity > maxStock) {
        toast({ 
            title: "Limite de Estoque", 
            description: `Estoque máximo: ${maxStock}`, 
            variant: "destructive" 
        })
        return
    }

    if (quantity === 0) {
        removeItem(productId)
        return
    }

    try {
        await updateItemQuantityInSale(currentSaleId, currentItem.saleItemId, quantity)

        setCartItems(prev => prev.map(item => {
            if (String(item.product.id) === String(productId)) {
                return { ...item, quantity, subtotal: quantity * item.unitPrice }
            }
            return item
        }))
    } catch (err: unknown) {
        const error = err as AxiosError
        toast({ 
            title: "Erro", 
            description: error.response?.data?.detail || "Não foi possível ajustar.", 
            variant: "destructive" 
        })
    }
  }

  const removeItem = async (productId: string) => {
    const itemToRemove = cartItems.find(item => String(item.product.id) === String(productId))
    if (!itemToRemove || !currentSaleId || !itemToRemove.saleItemId) return

    try {
        await removeItemFromSale(currentSaleId, itemToRemove.saleItemId)
        setCartItems((prev) => prev.filter((item) => item.product.id.toString() !== String(productId)))
        toast({ title: "Removido", description: "Item removido da venda." })
    } catch (err: unknown) {
        console.error(err)
        toast({ title: "Erro", description: "Erro ao remover item.", variant: "destructive" })
    }
  }

  const clearCart = () => {
    if(confirm("Esvaziar carrinho?")) {
        setCartItems([])
    }
  }

  const handleConfirmSale = async (paymentMethod: string, amountPaid?: number) => {
    if (!currentSaleId) return
    
    const _ = amountPaid 

    try {
        const methodMap: Record<string, string> = { cash: "DINHEIRO", card: "CARTAO", pix: "PIX" }
        const backendMethod = methodMap[paymentMethod] || "DINHEIRO"

        await finalizeSale(currentSaleId, backendMethod) 
        
        toast({
            title: "Venda Finalizada!",
            description: `Venda concluída com sucesso.`,
            variant: "success"
        })

        setCartItems([])
        setCurrentSaleId(null)
        setIsPaymentModal(false)

    } catch (err: unknown) {
        const error = err as AxiosError
        toast({ 
            title: "Erro ao finalizar", 
            description: error.response?.data?.detail || "Erro na baixa de estoque.", 
            variant: "destructive" 
        })
    }
  }

  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  if (isLoadingSale && !currentSaleId) {
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
        <div className="flex justify-between items-end">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">Gestão de Vendas</h1>
                <div className="flex items-center gap-3 text-lg text-muted-foreground">
                    <span className="font-medium text-foreground/80">
                        {selectedBranchId
                            ? `Filial ${branches.find(b => b.id.toString() === selectedBranchId)?.nome || ''}`
                            : "Selecione uma filial para iniciar"}
                    </span>

                    {currentSaleId && (
                        <span className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide bg-green-100 text-green-700 animate-pulse">
                           <ShoppingCart className="w-3 h-3" /> Venda em Andamento
                        </span>
                    )}
                </div>
            </div>

            {user?.role === 'admin' && (
                <div className="w-64">
                    <Select value={selectedBranchId} onValueChange={handleBranchChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione a Filial" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map(b => (
                                <SelectItem key={b.id} value={b.id.toString()}>
                                    {b.nome} {b.esta_ativa ? '' : '(Inativa)'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <CardTitle>Catálogo de Produtos</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <ProductSearch 
                    branchId={selectedBranchId} 
                    cartItems={cartItems} 
                    onAddToCart={addToCart} 
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 flex flex-col">
            <div className="flex-1">
                <ShoppingCartComponent
                items={cartItems}
                onUpdateQuantity={(id, qtd) => updateQuantity(id, qtd)} 
                onRemoveItem={(id) => removeItem(id)}
                onClearCart={clearCart}
                />
            </div>

            <Button 
                onClick={() => setIsPaymentModal(true)} 
                className="w-full h-16 shadow-lg bg-green-600 hover:bg-green-700 text-white relative" 
                size="lg"
                disabled={cartItems.length === 0}
            >
                <span className="text-xl font-bold tracking-wide">FINALIZAR VENDA</span>
                <ArrowRight className="absolute right-6 h-6 w-6 opacity-70" />
            </Button>
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