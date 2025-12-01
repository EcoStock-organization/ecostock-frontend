"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Check, Ban } from "lucide-react"
import type { ProductWithCategory, CartItem } from "@/lib/types"
import { coreApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProductSearchProps {
  branchId?: string
  cartItems?: CartItem[] 
  onAddToCart: (product: ProductWithCategory, quantity: number) => void
}

interface SearchResponseItem {
    id: number;
    nome: string;
    codigo_barras: string;
    categoria: string;
    disponibilidade: { filial: string; filial_id: number; quantidade: number; preco: string | number }[];
}

interface ProductSearchResult extends ProductWithCategory {
    estoque_display: number;
}

export function ProductSearch({ branchId, cartItems = [], onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (term: string) => {
    setSearchTerm(term)

    if (term.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)

    try {
      const response = await coreApi.get<SearchResponseItem[]>(`/relatorios/busca-global/?q=${term}`)
      
      const mappedResults: ProductSearchResult[] = response.data.map((item) => {
        const targetId = branchId ? Number(branchId) : null;

        const stockInfo = item.disponibilidade?.find((d) => 
            targetId ? d.filial_id === targetId : true
        ) || item.disponibilidade?.[0]

        return {
            id: item.id,
            nome: item.nome,
            codigo_barras: item.codigo_barras,
            preco_venda: stockInfo ? Number(stockInfo.preco) : 0,
            esta_ativo: true,
            tipo_produto: "UNITARIO", 
            categoria_nome: item.categoria || "Geral",
            // Propriedade adicionada via interface estendida
            estoque_display: stockInfo ? stockInfo.quantidade : 0
        }
      })

      setSearchResults(mappedResults)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    } finally {
        setLoading(false)
    }
  }

  const handleAddProduct = (product: ProductSearchResult) => {
    const stock = product.estoque_display
    
    if (stock <= 0) {
        toast({ title: "Estoque Esgotado", description: "Não é possível adicionar este item.", variant: "destructive" })
        return
    }

    const isInCart = cartItems.some(item => String(item.product.id) === String(product.id))

    if (isInCart) {
        toast({ title: "Já no carrinho", description: "Altere a quantidade no painel ao lado.", variant: "warning" })
        return
    }

    onAddToCart(product, 1)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome ou código..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 text-lg h-12"
          disabled={!branchId} 
        />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground pl-2">Buscando...</p>
      )}

      {searchResults.length > 0 ? (
        <Card className="max-h-96 overflow-y-auto border-t-0 rounded-t-none shadow-lg relative -top-2 z-50">
          <CardContent className="p-0">
            {searchResults.map((product) => {
               const isInCart = cartItems.some(item => String(item.product.id) === String(product.id))
               const stock = product.estoque_display
               const hasStock = stock > 0

               return (
              <div
                key={product.id}
                className={`flex items-center justify-between p-4 border-b last:border-b-0 transition-colors ${hasStock ? 'hover:bg-muted/50' : 'bg-muted/30 opacity-70'}`}
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{product.nome}</h3>
                    <Badge variant="outline" className="text-xs font-normal">
                      {product.categoria_nome || "Geral"}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground font-mono bg-muted px-1 rounded">{product.codigo_barras}</span>
                    <span className={`font-bold ${stock === 0 ? 'text-destructive' : stock < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                        {stock === 0 ? "Sem Estoque" : `${stock} em estoque`}
                    </span>
                  </div>
                  
                  <p className="text-lg font-bold text-primary">
                    R$ {product.preco_venda ? Number(product.preco_venda).toFixed(2) : '0.00'}
                  </p>
                </div>
                
                <Button 
                    onClick={() => handleAddProduct(product)} 
                    size="sm" 
                    variant={!hasStock ? "ghost" : isInCart ? "secondary" : "default"}
                    className="min-w-[110px]"
                    disabled={isInCart || !hasStock}
                >
                  {!hasStock ? (
                      <><Ban className="h-4 w-4 mr-2" /> Esgotado</>
                  ) : isInCart ? (
                      <><Check className="h-4 w-4 mr-2" /> No Carrinho</>
                  ) : (
                      <><Plus className="h-4 w-4 mr-2" /> Adicionar</>
                  )}
                </Button>
              </div>
            )})}
          </CardContent>
        </Card>
      ) : searchTerm.length >= 2 && !loading ? (
        <div className="p-4 text-center text-muted-foreground bg-muted/20 rounded-md">
            Nenhum produto encontrado com &quot;{searchTerm}&quot;.
        </div>
      ) : null}
    </div>
  )
}