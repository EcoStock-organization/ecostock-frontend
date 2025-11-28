// frontend/components/sales/product-search.tsx

"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus } from "lucide-react"
import type { ProductWithCategory } from "@/lib/types"
import { coreApi } from "@/lib/api"     // <=== CORREÇÃO: Usar coreApi
import { getProductsWithCategories } from "@/lib/mock-data" // Mantemos para o caso de o endpoint falhar

interface ProductSearchProps {
  onAddToCart: (product: ProductWithCategory, quantity: number) => void
}

export function ProductSearch({ onAddToCart }: ProductSearchProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<ProductWithCategory[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (term: string) => {
    setSearchTerm(term)

    if (term.length < 2) {
      setSearchResults([])
      return
    }

    setLoading(true)

    try {
      // Usando o endpoint de busca global (API Principal)
      // Nota: Este endpoint ainda precisa ser criado no Backend (Passo D)
      const response = await coreApi.get(`/relatorios/busca-global/?q=${term}`)
      
      // Mapeamos a resposta da API (que é mais complexa) para a lista de produtos simples
      const mappedResults = response.data.map((item: any) => ({
            id: item.id,
            nome: item.nome,
            codigo_barras: item.codigo_barras,
            // A disponibilidade é uma lista de objetos, aqui simplificamos para o primeiro item de venda (apenas para exibição)
            preco_venda: item.disponibilidade[0]?.preco, 
            categoria_nome: "API", // Mockar categoria já que a busca global não retorna categoria
      }))

      setSearchResults(mappedResults)
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
      // Em caso de erro na API, voltamos ao mock
      const mockProducts = getProductsWithCategories();
      const query = term.toLowerCase();
      const fallbackResults = mockProducts.filter((product) =>
          (product.nome?.toLowerCase() || '').includes(query) ||
          (product.codigo_barras?.includes(term))
      );
      setSearchResults(fallbackResults);
      
    }

    setLoading(false)
  }

  const handleAddProduct = (product: ProductWithCategory) => {
    onAddToCart(product, 1)
    setSearchTerm("")
    setSearchResults([])
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produto por nome, código de barras ou categoria..."
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10 text-lg h-12"
        />
      </div>

      {loading && (
        <p className="text-sm text-muted-foreground pl-2">Buscando…</p>
      )}

      {searchResults.length > 0 ? ( // Usamos searchResults.length
        <Card className="max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.map((product) => (
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
                  <p className="text-sm text-muted-foreground">{product.codigo_barras}</p>
                  <p className="text-lg font-semibold text-primary">R$ {product.preco_venda?.toFixed(2)}</p>
                </div>
                <Button onClick={() => handleAddProduct(product)} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : searchTerm.length >= 2 && !loading ? (
        <p className="text-sm text-muted-foreground pl-2">Nenhum produto encontrado na busca.</p>
      ) : null}
    </div>
  )
}
