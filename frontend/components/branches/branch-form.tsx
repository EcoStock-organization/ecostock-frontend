"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { coreApi } from "@/lib/api"
import type { Branch, User } from "@/lib/types"

interface BranchFormProps {
  isOpen: boolean
  onClose: () => void
  branch?: Branch
  onSave: () => void
  users: User[] // Lista de usuários reais
}

export function BranchForm({ isOpen, onClose, branch, onSave, users }: BranchFormProps) {
  const [formData, setFormData] = useState({
    nome: "",
    cep: "",
    logradouro: "",
    cidade: "",
    estado: "",
    gerente_id: "",
    esta_ativa: true,
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Filtra apenas gerentes ou admins disponíveis para serem gerentes da filial
  // Nota: O backend valida unicidade, aqui filtramos para ajudar a UI
  const availableManagers = users.filter(
    (user) => (user.role === "manager" || user.role === "admin")
  )

  useEffect(() => {
    if (isOpen) {
      if (branch) {
        setFormData({
          nome: branch.nome,
          cep: branch.cep,
          logradouro: branch.logradouro,
          cidade: branch.cidade,
          estado: branch.estado,
          gerente_id: branch.gerente_id ? branch.gerente_id.toString() : "",
          esta_ativa: branch.esta_ativa,
        })
      } else {
        // Reset form
        setFormData({
          nome: "", cep: "", logradouro: "", cidade: "", estado: "",
          gerente_id: "", esta_ativa: true,
        })
      }
    }
  }, [isOpen, branch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validação básica
      if (!formData.nome || !formData.cep || !formData.logradouro || !formData.cidade || !formData.estado) {
        toast({
          title: "Erro de validação",
          description: "Preencha todos os campos de identificação e endereço.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const payload = {
        ...formData,
        gerente_id: formData.gerente_id ? Number(formData.gerente_id) : null,
      }

      if (branch) {
        // Edição
        await coreApi.patch(`/filiais/${branch.id}/`, payload)
        toast({ title: "Sucesso", description: "Filial atualizada." })
      } else {
        // Criação
        await coreApi.post("/filiais/", payload)
        toast({ title: "Sucesso", description: "Filial criada." })
      }

      onSave()
      onClose()
    } catch (error: any) {
      console.error(error)
      const errorMsg = error.response?.data?.detail || error.response?.data?.nome?.[0] || "Ocorreu um erro ao salvar a filial."
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                  value={formData.nome}
                  onChange={(e) => handleInputChange("nome", e.target.value)}
                  placeholder="Ex: Filial Centro"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <Label htmlFor="cep">CEP *</Label>
                    <Input
                    id="cep"
                    value={formData.cep}
                    onChange={(e) => handleInputChange("cep", e.target.value)}
                    placeholder="00000-000"
                    required
                    />
                 </div>
                 <div>
                    <Label htmlFor="cidade">Cidade *</Label>
                    <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => handleInputChange("cidade", e.target.value)}
                    placeholder="Brasília"
                    required
                    />
                 </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Label htmlFor="logradouro">Logradouro *</Label>
                    <Input
                    id="logradouro"
                    value={formData.logradouro}
                    onChange={(e) => handleInputChange("logradouro", e.target.value)}
                    placeholder="Av. Principal, 100"
                    required
                    />
                  </div>
                  <div>
                    <Label htmlFor="estado">UF *</Label>
                    <Input
                    id="estado"
                    maxLength={2}
                    value={formData.estado}
                    onChange={(e) => handleInputChange("estado", e.target.value.toUpperCase())}
                    placeholder="DF"
                    required
                    />
                  </div>
              </div>

              <div>
                <Label htmlFor="manager">Gerente</Label>
                <Select value={formData.gerente_id} onValueChange={(value) => handleInputChange("gerente_id", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um gerente" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id.toString()}>
                        {manager.name} ({manager.role})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[0.8rem] text-muted-foreground mt-1">Apenas usuários com cargo Gerente ou Admin.</p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.esta_ativa}
                  onCheckedChange={(checked) => handleInputChange("esta_ativa", checked)}
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
