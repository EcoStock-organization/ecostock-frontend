"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { coreApi } from "@/lib/api"
import type { Product, Category } from "@/lib/types"

interface ProductFormProps {
  isOpen: boolean
  onClose: () => void
  product?: Product
  onSave: () => void
}

export function ProductForm({ isOpen, onClose, product, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    codigo_barras: "",
    id_categoria: "",
    tipo_produto: "UNITARIO",
    esta_ativo: true,
    // Campos numéricos como string para facilitar edição no input
    preco_venda: "",
    preco_custo: "",
    estoque_minimo: ""
  })

  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // 1. Buscar Categorias
  useEffect(() => {
    if (isOpen) {
        coreApi.get("/produtos/categorias/")
            .then(response => {
                setCategories(response.data)
            })
            .catch(error => {
                console.error("Erro ao buscar categorias", error)
                toast({
                    title: "Aviso",
                    description: "Não foi possível carregar as categorias.",
                    variant: "destructive"
                })
            })

      if (product) {
        setFormData({
            nome: product.nome,
            descricao: product.descricao || "",
            codigo_barras: product.codigo_barras,
            id_categoria: product.id_categoria ? product.id_categoria.toString() : "",
            tipo_produto: product.tipo_produto,
            esta_ativo: product.esta_ativo,
            // Se o produto vier com preço, preenchemos, senão vazio
            preco_venda: product.preco_venda?.toString() || "",
            preco_custo: product.preco_custo?.toString() || "",
            estoque_minimo: product.min_stock?.toString() || ""
        })
      } else {
        // Resetar form
        setFormData({
            nome: "",
            descricao: "",
            codigo_barras: "",
            id_categoria: "",
            tipo_produto: "UNITARIO",
            esta_ativo: true,
            preco_venda: "",
            preco_custo: "",
            estoque_minimo: ""
        })
      }
    }
  }, [isOpen, product, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validação básica
      if (!formData.nome || !formData.codigo_barras || !formData.id_categoria) {
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha nome, código de barras e categoria.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // 2. Montar Payload (Converter tipos para o que o Django espera)
      const payload = {
        nome: formData.nome,
        descricao: formData.descricao,
        codigo_barras: formData.codigo_barras,
        id_categoria: Number(formData.id_categoria), // Django espera número
        tipo_produto: formData.tipo_produto,
        esta_ativo: formData.esta_ativo,
        // Se o backend aceitar preços na criação do produto:
        // preco_venda: formData.preco_venda ? parseFloat(formData.preco_venda) : 0,
        // preco_custo: formData.preco_custo ? parseFloat(formData.preco_custo) : 0,
      }

      if (product) {
        // Edição
        await coreApi.patch(`/produtos/${product.id}/`, payload)
        toast({ title: "Sucesso", description: "Produto atualizado." })
      } else {
        // Criação
        await coreApi.post('/produtos/', payload)
        toast({ title: "Sucesso", description: "Produto criado." })
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error(error)
      const errorMsg = error.response?.data?.detail || "Erro ao salvar produto. Verifique os dados."
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
          <DialogDescription>
            {product ? "Atualize as informações do produto" : "Preencha os dados para criar um novo produto"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange("nome", e.target.value)}
                    placeholder="Ex: Coca-Cola 2L"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => handleInputChange("descricao", e.target.value)}
                    placeholder="Descrição detalhada do produto"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">Código de Barras *</Label>
                  <Input
                    id="barcode"
                    value={formData.codigo_barras}
                    onChange={(e) => handleInputChange("codigo_barras", e.target.value)}
                    placeholder="Ex: 7894900011517"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoria *</Label>
                  <Select value={formData.id_categoria} onValueChange={(value) => handleInputChange("id_categoria", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                   <Label htmlFor="tipo">Tipo do Produto</Label>
                   <Select value={formData.tipo_produto} onValueChange={(value) => handleInputChange("tipo_produto", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="UNITARIO">Unitário</SelectItem>
                        <SelectItem value="PESAVEL">Pesável</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Extra & Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.esta_ativo}
                    onCheckedChange={(checked) => handleInputChange("esta_ativo", checked)}
                  />
                  <Label htmlFor="isActive">Produto ativo</Label>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
                    <p><strong>Nota:</strong> A gestão de Preços e Estoque é feita individualmente por filial na aba "Estoque".</p>
                </div>
                
                {/* Campos visuais opcionais, caso queira enviar para o backend futuramente
                <div>
                  <Label htmlFor="unitPrice">Preço Sugerido (R$)</Label>
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={formData.preco_venda}
                    onChange={(e) => handleInputChange("preco_venda", e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                */}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : product ? "Atualizar" : "Criar Produto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
