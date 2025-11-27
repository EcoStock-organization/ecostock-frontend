"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { mockUsers } from "@/lib/mock-data"
import type { Branch } from "@/lib/types"

interface BranchFormProps {
  isOpen: boolean
  onClose: () => void
  branch?: Branch
  onSave: (branch: Partial<Branch>) => void
}

export function BranchForm({ isOpen, onClose, branch, onSave }: BranchFormProps) {
  const [formData, setFormData] = useState({
    name: branch?.name || "",
    address: branch?.address || "",
    managerId: branch?.managerId || "",
    isActive: branch?.isActive ?? true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const availableManagers = mockUsers.filter(
    (user) => user.role === "manager" && (!user.branchId || user.id === branch?.managerId),
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name || !formData.address || !formData.managerId) {
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      onSave(formData)

      toast({
        title: branch ? "Filial atualizada" : "Filial criada",
        description: `${formData.name} foi ${branch ? "atualizada" : "criada"} com sucesso`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a filial",
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{branch ? "Editar Filial" : "Nova Filial"}</DialogTitle>
          <DialogDescription>
            {branch ? "Atualize as informações da filial" : "Preencha os dados para criar uma nova filial"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações da Filial</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome da Filial *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: Filial Centro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Endereço *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Ex: Rua das Flores, 123 - Centro"
                  required
                />
              </div>

              <div>
                <Label htmlFor="manager">Gerente *</Label>
                <Select value={formData.managerId} onValueChange={(value) => handleInputChange("managerId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gerente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
                <Label htmlFor="isActive">Filial ativa</Label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : branch ? "Atualizar" : "Criar Filial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
