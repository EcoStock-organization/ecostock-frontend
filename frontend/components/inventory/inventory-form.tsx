"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { mockBranches, getProductsWithCategories, mockInventoryItems, mockProducts } from "@/lib/mock-data"
import type { InventoryItem, ProductWithCategory } from "@/lib/types"

interface InventoryFormProps {
  isOpen: boolean
  onClose: () => void
  item?: InventoryItem & { product?: ProductWithCategory }
  onSave: () => void
}

export function InventoryForm({ isOpen, onClose, item, onSave }: InventoryFormProps) {
  const products = getProductsWithCategories()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    productId: item?.productId || products[0]?.id || "",
    branchId: item?.branchId || mockBranches[0]?.id || "",
    currentStock: item?.currentStock?.toString() || "0",
    minStock: item?.minStock?.toString() || "0",
    reservedStock: item?.reservedStock?.toString() || "0",
  })

  const [isSaving, setIsSaving] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      if (!formData.productId || !formData.branchId) {
        toast({ title: "Erro", description: "Selecione produto e filial", variant: "destructive" })
        return
      }

      // If editing existing item, update it
      if (item) {
        const idx = mockInventoryItems.findIndex((it) => it.id === item.id)
        if (idx !== -1) {
          mockInventoryItems[idx] = {
            ...mockInventoryItems[idx],
            productId: formData.productId,
            branchId: formData.branchId,
            currentStock: Number.parseInt(formData.currentStock) || 0,
            reservedStock: Number.parseInt(formData.reservedStock) || 0,
            minStock: Number.parseInt(formData.minStock) || 0,
            updatedAt: new Date(),
          }
        }
        toast({ title: "Estoque atualizado", description: "Item de estoque atualizado com sucesso" })
      } else {
        // create a new inventory item
        const newItem: InventoryItem = {
          id: String(Date.now()),
          productId: formData.productId,
          branchId: formData.branchId,
          currentStock: Number.parseInt(formData.currentStock) || 0,
          reservedStock: Number.parseInt(formData.reservedStock) || 0,
          minStock: Number.parseInt(formData.minStock) || 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        mockInventoryItems.push(newItem)
        // ensure product exists (it should since we selected from list). If not, create placeholder
        if (!mockProducts.find((p) => p.id === formData.productId)) {
          mockProducts.push({
            id: formData.productId,
            name: "Produto",
            description: "",
            barcode: "",
            categoryId: products.find((p) => p.id === formData.productId)?.categoryId || "",
            unitPrice: 0,
            costPrice: 0,
            minStock: Number.parseInt(formData.minStock) || 0,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        }

        toast({ title: "Item criado", description: "Item de estoque criado com sucesso" })
      }

      onSave()
      onClose()
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível salvar o item", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{item ? "Editar Item de Estoque" : "Adicionar Item ao Estoque"}</DialogTitle>
          <DialogDescription>{item ? "Atualize os dados do item de estoque" : "Preencha os dados para adicionar o item ao estoque"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Estoque</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label>Produto</Label>
                <Select value={formData.productId} onValueChange={(v) => handleChange("productId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Filial</Label>
                <Select value={formData.branchId} onValueChange={(v) => handleChange("branchId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma filial" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockBranches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Estoque Atual</Label>
                <Input type="number" value={formData.currentStock} onChange={(e) => handleChange("currentStock", e.target.value)} />
              </div>

              <div>
                <Label>Estoque Mínimo</Label>
                <Input type="number" value={formData.minStock} onChange={(e) => handleChange("minStock", e.target.value)} />
              </div>

              <div>
                <Label>Estoque Reservado</Label>
                <Input type="number" value={formData.reservedStock} onChange={(e) => handleChange("reservedStock", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Salvando..." : item ? "Atualizar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
