"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import type { User } from "@/lib/types"
import { mockBranches } from "@/lib/mock-data"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  user?: User
  onSave: (user: Partial<User>) => void
}

export function UserForm({ isOpen, onClose, user, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "operator",
    branchId: user?.branchId || "",
  })

  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (!formData.name || !formData.email || (!user && !formData.password)) {
        toast({
          title: "Erro de validação",
          description: "Por favor, preencha todos os campos obrigatórios",
          variant: "destructive",
        })
        return
      }

      if ((formData.role === "manager" || formData.role === "operator") && !formData.branchId) {
        toast({
          title: "Erro de validação",
          description: "Por favor, selecione uma filial",
          variant: "destructive",
        })
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Erro de validação",
          description: "Por favor, insira um e-mail válido",
          variant: "destructive",
        })
        return
      }

      const userData: Partial<User> = {
        name: formData.name,
        email: formData.email,
        role: formData.role as "admin" | "manager" | "operator",
      }

      if ((formData.role === "manager" || formData.role === "operator") && formData.branchId) {
        userData.branchId = formData.branchId
      }

      if (formData.password) {
        userData.password = formData.password
      }

      onSave(userData)

      toast({
        title: user ? "Usuário atualizado" : "Usuário criado",
        description: `${formData.name} foi ${user ? "atualizado" : "criado"} com sucesso`,
      })

      onClose()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o usuário",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user ? "Atualize as informações do usuário" : "Preencha os dados para criar um novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Usuário</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ex: João Silva"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">E-mail *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Ex: joao@supermarket.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Senha {user ? "(deixe em branco para manter a atual)" : "*"}</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  placeholder="Digite a senha"
                  required={!user}
                />
              </div>

              <div>
                <Label htmlFor="role">Cargo *</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="operator">Operador de Caixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(formData.role === "manager" || formData.role === "operator") && (
                <div>
                  <Label htmlFor="branchId">Filial *</Label>
                  <Select value={formData.branchId} onValueChange={(value) => handleInputChange("branchId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a filial" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBranches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : user ? "Atualizar" : "Criar Usuário"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
