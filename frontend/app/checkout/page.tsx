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

import type { CartItem, InventoryItem, Branch } from "@/lib/types"
import { createSale, addItemToSale, finalizeSale } from "@/services/sales-service"
import { getBranches } from "@/services/branchService"

export default function CheckoutPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // Estados
  const [currentSaleId, setCurrentSaleId] = useState<string | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isLoadingSale, setIsLoadingSale] = useState(false)
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null)
  
  // Controle de inicialização para não criar vendas duplicadas no StrictMode
  const initialized = useRef(false)

  // 1. Verificar Auth e Carregar Filial
  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    // Se o usuário tem branchId (Operador/Gerente), carregamos os dados da filial
    if (user?.branchId) {
        getBranches().then(branches => {
            const myBranch = branches.find(b => b.id.toString() === user.branchId?.toString())
            if(myBranch) setCurrentBranch(myBranch)
        })
    }
  }, [isAuthenticated, user, router])

  // 2. Inicializar Venda (Criar 'carrinho' no backend)
  useEffect(() => {
    const initSale = async () => {
        if (!user?.branchId || currentSaleId || initialized.current) return
        
        initialized.current = true // Lock
        setIsLoadingSale(true)
        try {
            const sale = await createSale(user.branchId)
            setCurrentSaleId(sale.id)
            console.log("Venda iniciada:", sale.id)
        } catch (error) {
            console.error("Erro ao iniciar venda:", error)
            toast({ title: "Erro", description: "Falha ao iniciar sistema de vendas.", variant: "destructive" })
        } finally {
            setIsLoadingSale(false)
        }
    }
    
    initSale()
  }, [user, currentSaleId, toast])


  // 3. Adicionar Item (Chama API)
  const addToCart = async (inventoryItem: InventoryItem, quantity = 1) => {
    if (!currentSaleId) return

    try {
        // Chama backend para adicionar e validar estoque
        const itemVenda = await addItemToSale(currentSaleId, Number(inventoryItem.produto.id), quantity)
        
        // Atualiza UI
        setCartItems((prev) => {
            // Verifica se já existe no carrinho visual para agrupar (apenas visualmente, pois no backend cada add é um itemVenda)
            // Para simplificar, vamos confiar no retorno e adicionar à lista
            // Se quiser agrupar visualmente, precisaria de lógica extra, mas vamos manter simples.
            
            // Adaptando para o tipo CartItem da UI
            const newItem: CartItem = {
                productId: inventoryItem.produto.id.toString(),
                product: inventoryItem.produto, // O objeto produto completo
                quantity: quantity,
                unitPrice: Number(inventoryItem.preco_venda_atual),
                subtotal: quantity * Number(inventoryItem.preco_venda_atual)
            }
            
            // Lógica simples de agrupamento visual
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
    } catch (error: any) {
        const msg = error.response?.data?.detail || error.response?.data?.[0] || "Erro ao adicionar item."
        toast({ title: "Erro", description: msg, variant: "destructive" })
    }
  }

  // 4. Finalizar Venda
  const handleConfirmSale = async (paymentMethod: string) => {
    if (!currentSaleId) return

    try {
        // Mapeia 'cash' -> 'DINHEIRO' para o backend
        const methodMap: Record<string, string> = {
            cash: "DINHEIRO", card: "CARTAO", pix: "PIX"
        }
        const backendMethod = methodMap[paymentMethod] || "DINHEIRO"

        await finalizeSale(currentSaleId, backendMethod)
        
        toast({
            title: "Venda Finalizada!",
            description: `Venda #${currentSaleId} concluída com sucesso.`,
            variant: "success" // Se tiver variant success configurado, senão default
        })

        // Resetar para próxima venda
        setCartItems([])
        setCurrentSaleId(null)
        initialized.current = false // Permite criar nova venda
        
        // O useEffect[initSale] vai rodar de novo e criar uma nova venda ID

    } catch (error: any) {
        toast({ 
            title: "Erro ao finalizar", 
            description: error.response?.data?.detail || "Tente novamente.", 
            variant: "destructive" 
        })
    }
  }
  
  const updateQuantity = async (productId: string, newQuantity: number) => {
    // Encontra o item no carrinho atual
    const currentItem = cartItems.find(item => item.productId === productId)
    if (!currentItem || !currentSaleId) return

    const diff = newQuantity - currentItem.quantity

    if (diff > 0) {
      // Se aumentou, chama o endpoint de adicionar (que já temos)
      try {
        await addItemToSale(currentSaleId, Number(productId), diff)
        
        // Atualiza visualmente
        setCartItems(prev => prev.map(item => 
          item.productId === productId 
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.unitPrice }
            : item
        ))
      } catch (error) {
        toast({ title: "Erro ao adicionar", description: "Estoque insuficiente ou erro no servidor.", variant: "destructive" })
      }
    } else {
      // Se diminuiu, avisamos que a remoção ainda não tem endpoint (ou precisaríamos criar endpoint de remover)
      toast({ 
        title: "Ação não permitida", 
        description: "Para diminuir a quantidade, remova o item e adicione novamente (limitação da API atual).",
        variant: "warning"
      })
    }
  }
  const removeItem = (productId: string) => {
      toast({ title: "Aviso", description: "Remoção de item não implementada nesta versão." })
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  if (!user || isLoadingSale) {
      return (
        <div className="flex h-screen items-center justify-center bg-app-gradient">
            <div className="text-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Iniciando caixa...</p>
            </div>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-app-gradient flex flex-col overflow-hidden">
      <CheckoutHeader user={user} branch={currentBranch || undefined} />

      <div className="flex-1 flex overflow-hidden p-4 gap-4">
        {/* Esquerda: Busca */}
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
          />
        </div>

        {/* Direita: Carrinho */}
        <div className="w-2/5">
          <CartSummary
            cartItems={cartItems}
            subtotal={subtotal}
            discount={0} // Implementar desconto no futuro
            total={subtotal}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeItem}
            onDiscountChange={() => {}}
          />
          
          {cartItems.length > 0 && (
             <div className="mt-4">
                 <Button 
                    className="w-full h-14 text-xl font-bold shadow-lg" 
                    onClick={() => setIsPaymentModalOpen(true)}
                 >
                    <Receipt className="mr-2 h-6 w-6" />
                    Pagar R$ {subtotal.toFixed(2)}
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
