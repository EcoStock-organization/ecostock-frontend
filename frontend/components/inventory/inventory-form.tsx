"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { coreApi } from "@/lib/api"
import type { InventoryItem, Product } from "@/lib/types"

interface InventoryFormProps {
  isOpen: boolean
  onClose: () => void
  item?: InventoryItem
  branchId: string
  onSave: () => void
}

export function InventoryForm({ isOpen, onClose, item, branchId, onSave }: InventoryFormProps) {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    produto_id: "",
    quantidade_atual: "",
    preco_venda_atual: "",
    quantidade_minima_estoque: "",
  })

  useEffect(() => {
    if (isOpen && !item) {
      coreApi.get("/produtos/").then(res => setProducts(res.data))
    }
  }, [isOpen, item])

  useEffect(() => {
    if (item) {
      setFormData({
        produto_id: item.produto.id.toString(),
        quantidade_atual: item.quantidade_atual.toString(),
        preco_venda_atual: item.preco_venda_atual.toString(),
        quantidade_minima_estoque: item.quantidade_minima_estoque.toString(),
      })
    } else {
      setFormData({
        produto_id: "",
        quantidade_atual: "0",
        preco_venda_atual: "0",
        quantidade_minima_estoque: "10",
      })
    }
  }, [item, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const payload = {
        produto_id: Number(formData.produto_id),
        quantidade_atual: Number(formData.quantidade_atual),
        preco_venda_atual: Number(formData.preco_venda_atual),
        quantidade_minima_estoque: Number(formData.quantidade_minima_estoque)
      }

      if (item) {
        await coreApi.patch(`/filiais/${branchId}/estoque/${item.id}/`, payload)
        toast({ title: "Sucesso", description: "Estoque atualizado." })
      } else {
        await coreApi.post(`/filiais/${branchId}/estoque/`, payload)
        toast({ title: "Sucesso", description: "Item adicionado ao estoque." })
      }
      onSave()
      onClose()
    } catch (error: any) {
      console.error(error)
      const msg = error.response?.data?.non_field_errors?.[0] || "Erro ao salvar. Verifique se o produto já existe nesta filial."
      toast({ title: "Erro", description: msg, variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Estoque" : "Adicionar Produto ao Estoque"}</DialogTitle>
          <DialogDescription>Defina a quantidade e o preço de venda para esta filial.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
            {!item && (
                <div>
                    <Label>Produto</Label>
                    <Select 
                        value={formData.produto_id} 
                        onValueChange={(v) => setFormData(prev => ({...prev, produto_id: v}))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione o produto" />
                        </SelectTrigger>
                        <SelectContent>
                            {products.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>
                                    {p.nome} ({p.codigo_barras})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Qtd. Atual</Label>
                    <Input 
                        type="number" 
                        value={formData.quantidade_atual} 
                        onChange={e => setFormData({...formData, quantidade_atual: e.target.value})}
                    />
                </div>
                <div>
                    <Label>Estoque Mínimo</Label>
                     <Input 
                        type="number" 
                        value={formData.quantidade_minima_estoque} 
                        onChange={e => setFormData({...formData, quantidade_minima_estoque: e.target.value})}
                    />
                </div>
            </div>

            <div>
                <Label>Preço de Venda (R$)</Label>
                <Input 
                    type="number" step="0.01"
                    value={formData.preco_venda_atual} 
                    onChange={e => setFormData({...formData, preco_venda_atual: e.target.value})}
                />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" type="button" onClick={onClose}>Cancelar</Button>
                <Button type="submit" disabled={isLoading}>Salvar</Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
