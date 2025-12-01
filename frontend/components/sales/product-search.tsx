"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Check } from "lucide-react"
import type { ProductWithCategory, CartItem } from "@/lib/types"
import { coreApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ProductSearchProps {
  branchId?: string
  cartItems?: CartItem[] 
  onAddToCart: (product: ProductWithCategory, quantity: number) => void
}

interface Disponibilidade {
    filial: string;
    quantidade: number;
    preco: string | number;
}

interface SearchResponseItem {
    id: number;
    nome: string;
    codigo_barras: string;
    categoria: string;
    disponibilidade: Disponibilidade[];
}

export function ProductSearch({ branchId, cartItems = [], onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductWithCategory[]>([])
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
      
      const mappedResults: ProductWithCategory[] = response.data.map((item) => {
        const stockInfo = item.disponibilidade?.[0]

        return {
            id: item.id,
            nome: item.nome,
            codigo_barras: item.codigo_barras,
            preco_venda: stockInfo ? Number(stockInfo.preco) : 0,
            esta_ativo: true,
            tipo_produto: "UNITARIO", 
            categoria_nome: item.categoria || "Geral",
            barcode: item.codigo_barras
        }
      })

      setSearchResults(mappedResults)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    } finally {
        setLoading(false)
    }
  }

  const handleAddProduct = (product: ProductWithCategory) => {
    const isInCart = cartItems.some(item => String(item.product.id) === String(product.id))

    if (isInCart) {
        toast({
            title: "Produto já no carrinho",
            description: "Aumente a quantidade diretamente na lista ao lado.",
            variant: "warning"
        })
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
          placeholder="Buscar produto por nome, código ou categoria..."
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
        <Card className="max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.map((product) => {
               const isInCart = cartItems.some(item => String(item.product.id) === String(product.id))
               
               return (
              <div
                key={product.id}
                className="flex items-center justify-between p-4 border-b border-border last:border-b-0 hover:bg-muted/50"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{product.nome}</h3>
                    <Badge variant="outline" className="text-xs">
                      {product.categoria_nome || "N/A"}
                    </Badge>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground font-mono">{product.codigo_barras}</span>
                  </div>
                  <p className="text-lg font-semibold text-primary">
                    R$ {product.preco_venda ? Number(product.preco_venda).toFixed(2) : 'N/A'}
                  </p>
                </div>
                
                <Button 
                    onClick={() => handleAddProduct(product)} 
                    size="sm" 
                    variant={isInCart ? "secondary" : "default"}
                    className="flex items-center gap-1"
                    disabled={isInCart}
                >
                  {isInCart ? (
                      <><Check className="h-4 w-4" /> No Carrinho</>
                  ) : (
                      <><Plus className="h-4 w-4" /> Adicionar</>
                  )}
                </Button>
              </div>
            )})}
          </CardContent>
        </Card>
      ) : searchTerm.length >= 2 && !loading ? (
        <p className="text-sm text-muted-foreground pl-2">Nenhum produto encontrado.</p>
      ) : null}
    </div>
  )
}