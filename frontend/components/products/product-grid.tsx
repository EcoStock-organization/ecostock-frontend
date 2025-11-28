"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProductForm } from "./product-form"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { coreApi } from "@/lib/api" // Importando a API real
import type { Product, Category } from "@/lib/types"

export function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | undefined>()

  const { toast } = useToast()

  // Função para buscar dados reais
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        coreApi.get("/produtos/"),
        coreApi.get("/produtos/categorias/")
      ])
      setProducts(productsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error("Erro ao carregar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar ao montar
  useEffect(() => {
    fetchData()
  }, [])

  // Filtragem no Front (pode ser movida para o back se a lista for muito grande)
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.codigo_barras.includes(searchTerm) ||
      (product.categoria_nome && product.categoria_nome.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || 
      (product.id_categoria && product.id_categoria.toString() === selectedCategory) ||
      (product.categoria_nome === selectedCategory) // Fallback caso id_categoria não venha na listagem

    return matchesSearch && matchesCategory
  })

  const handleSaveProduct = () => {
    // Recarrega os dados para garantir sincronia
    fetchData()
    setEditingProduct(undefined)
    setIsFormOpen(false)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsFormOpen(true)
  }

  const handleDeleteProduct = async (productId: number) => {
    if(!confirm("Tem certeza que deseja remover este produto?")) return;

    try {
      await coreApi.delete(`/produtos/${productId}/`)
      
      // Atualiza a lista localmente
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      
      toast({
        title: "Produto removido",
        description: "O produto foi removido do catálogo com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao deletar:", error)
      toast({
        title: "Erro",
        description: "Não foi possível remover o produto. Verifique se ele possui vínculo com estoque ou vendas.",
        variant: "destructive"
      })
    }
  }

  const handleNewProduct = () => {
    setEditingProduct(undefined)
    setIsFormOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Catálogo de Produtos</CardTitle>
              <CardDescription>
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "produto encontrado" : "produtos encontrados"}
              </CardDescription>
            </div>
            <Button onClick={handleNewProduct} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou código de barras..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Produtos */}
      {isLoading ? (
        <div className="flex justify-center py-12">
             <p className="text-muted-foreground">Carregando produtos...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Comece adicionando produtos ao catálogo"}
            </p>
            <Button onClick={handleNewProduct}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Produto
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg line-clamp-2">{product.nome}</CardTitle>
                    <Badge variant="outline">{product.categoria_nome || "Sem Categoria"}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-mono">{product.codigo_barras}</span>
                  </div>
                  {/* Nota: Preços e Estoque geralmente ficam no endpoint de Estoque/Filial, 
                      mas se o endpoint de produtos retornar, podem ser exibidos aqui. 
                      Deixei comentado para evitar erro se o campo for undefined */}
                  {/* <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Preço Venda:</span>
                    <span className="font-semibold text-primary">
                        {product.preco_venda ? `R$ ${product.preco_venda}` : '-'}
                    </span>
                  </div> 
                  */}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <Badge variant={product.esta_ativo ? "default" : "secondary"}>
                    {product.esta_ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>

                {product.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{product.descricao}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Formulário */}
      <ProductForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  )
}
