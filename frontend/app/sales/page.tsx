"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { ProductSearch } from "@/components/sales/product-search"
import { ShoppingCartComponent } from "@/components/sales/shopping-cart"
import { PaymentModal } from "@/components/sales/payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Receipt, Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createSale, addItemToSale, finalizeSale, removeItemFromSale, updateItemQuantityInSale } from "@/services/sales-service"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getBranches } from "@/services/branchService" 

import type { ProductWithCategory, SaleItem, Branch } from "@/lib/types"

interface CartItemWithSaleId {
    productId: string;
    product: ProductWithCategory;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    saleItemId?: number;
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
      initializedSale.current = false
      setSelectedBranchId(newBranchId)
  }
  
  const addToCart = async (product: ProductWithCategory, quantity: number) => {
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
    } catch (err: any) {
        const msg = err.response?.data?.detail || "Erro ao adicionar item."
        toast({ title: "Erro", description: msg, variant: "destructive" })
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    const currentItem = cartItems.find(item => String(item.product.id) === String(productId))
    if (!currentItem || !currentSaleId || !currentItem.saleItemId) return

    if (quantity === 0) {
        removeItem(productId)
        return
    }

    try {
        await updateItemQuantityInSale(currentSaleId, currentItem.saleItemId, quantity)

        setCartItems(prev => prev.map(item => {
            if (String(item.product.id) === String(productId)) {
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

  const removeItem = async (productId: string) => {
    const itemToRemove = cartItems.find(item => String(item.product.id) === String(productId))
    
    if (!itemToRemove || !currentSaleId || !itemToRemove.saleItemId) {
        setCartItems(prev => prev.filter(item => String(item.product.id) !== String(productId)))
        return
    }

    try {
        await removeItemFromSale(currentSaleId, itemToRemove.saleItemId)
        setCartItems(prev => prev.filter(item => String(item.product.id) !== String(productId)))
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
        initializedSale.current = false 
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
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Sistema de Vendas</h1>
          <p className="text-muted-foreground">
             {currentSaleId ? `Venda #${currentSaleId}` : "Aguardando início..."} 
             {selectedBranchId && ` | Filial ${branches.find(b => b.id.toString() === selectedBranchId)?.nome || selectedBranchId}`}
          </p>
        </div>

        {/* Seletor para Admin */}
        {user?.role === 'admin' && (
            <div className="w-full max-w-xs mb-4">
                <Select value={selectedBranchId} onValueChange={handleBranchChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="Selecione a Filial para Vender" />
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

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Buscar Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {/* ProductSearch modificado para receber cartItems deve estar no outro arquivo, mas a chamada aqui está correta */}
                <ProductSearch 
                    branchId={selectedBranchId} // Usa o ID selecionado
                    cartItems={cartItems}
                    onAddToCart={addToCart} 
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <ShoppingCartComponent
              items={cartItems}
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