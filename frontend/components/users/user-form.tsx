"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

import type { User, Branch } from "@/lib/types"
import { getBranches } from "@/services/branchService"
import { criarUsuario, atualizarUsuario } from "@/services/usuarioService"

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  user?: User
  onSave: () => void
}

type RoleKey = "admin" | "manager" | "operator"

type UserPayload = {
  nome_completo: string
  email: string
  cargo: string
  filial: number | null
  ativo: boolean
  password?: string
  username?: string
  cpf?: string | null
}

export function UserForm({ isOpen, onClose, user, onSave }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "operator" as RoleKey,
    branchId: "", // keep as string for Select controlled component
    cpf: "",
  })

  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Load branches when dialog opens
  useEffect(() => {
    if (!isOpen) return
    let mounted = true

    getBranches()
      .then((b) => {
        if (mounted) setBranches(b)
      })
      .catch((err) => {
        console.error("Erro ao carregar filiais", err)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as filiais.",
          variant: "destructive",
        })
      })

    return () => {
      mounted = false
    }
  }, [isOpen, toast])

  // Populate form when editing
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name ?? "",
        email: user.email ?? "",
        password: "",
        // map backend role (if backend provides different names, adapt accordingly)
        role: (user.role as RoleKey) ?? "operator",
        branchId: user.branchId?.toString() ?? "",
        cpf: "", // CPF normally isn't returned in listing; keep empty in edit
      })
    } else {
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "operator",
        branchId: "",
        cpf: "",
      })
    }
  }, [user, isOpen])

  const roleMapping: Record<RoleKey, string> = {
    admin: "ADMIN",
    manager: "GERENTE",
    operator: "OPERADOR",
  }

  // Helper to extract a friendly error message from backend responses / Axios errors
  const extractErrorMessage = (err: unknown): string => {
    // Avoid using `any` for ESLint; use type checks
    // Axios-like error: has response.data
    const e = err as { response?: { data?: unknown }; message?: string }
    if (e?.response?.data) {
      const data = e.response.data
      if (typeof data === "string") return data
      if (typeof data === "object" && data !== null) {
        // If there's a "detail" field, use it
        const dd = data as Record<string, unknown>
        if (typeof dd.detail === "string") return dd.detail

        // Otherwise produce a combined message from validation fields
        const parts: string[] = []
        for (const key of Object.keys(dd)) {
          const val = dd[key]
          if (Array.isArray(val) && val.length > 0) {
            parts.push(`${key}: ${String(val[0])}`)
          } else {
            parts.push(`${key}: ${String(val)}`)
          }
        }
        if (parts.length > 0) return parts.join("; ")
      }
    }
    return e?.message ?? "Erro desconhecido ao salvar."
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Basic front validations
      if (!formData.name.trim() || !formData.email.trim()) {
        throw new Error("Preencha nome e e-mail.")
      }

      if (!user && !formData.password) {
        throw new Error("Senha é obrigatória para novos usuários.")
      }

      // For manager/operator, filial must be selected
      if (
        (formData.role === "manager" || formData.role === "operator") &&
        !formData.branchId
      ) {
        throw new Error("Selecione uma filial para este cargo.")
      }

      // Build payload with strict typing
      const payload: UserPayload = {
        nome_completo: formData.name.trim(),
        email: formData.email.trim(),
        cargo: roleMapping[formData.role],
        filial: formData.branchId ? Number(formData.branchId) : null,
        ativo: true,
      }

      if (!user) {
        // CPF is required for creation
        if (!formData.cpf || !formData.cpf.trim()) {
          throw new Error("CPF é obrigatório.")
        }
        // sanitize cpf safely
        payload.cpf = formData.cpf ? formData.cpf.replace(/\D/g, "") : null
        payload.password = formData.password
        payload.username = formData.email.trim()
      } else {
        // on update: only include password if provided
        if (formData.password && formData.password.trim().length > 0) {
          payload.password = formData.password
        }
      }

      // Debug: show payload in console (can be removed later)
      // console.debug("Payload usuario:", payload)

      if (user) {
        await atualizarUsuario(user.id, payload)
        toast({ title: "Sucesso", description: "Usuário atualizado." })
      } else {
        await criarUsuario(payload)
        toast({ title: "Sucesso", description: "Usuário criado com sucesso." })
      }

      onSave()
      onClose()
    } catch (err) {
      console.error("Erro ao salvar usuário:", err)
      const msg = extractErrorMessage(err)
      toast({
        title: "Erro ao salvar",
        description: msg,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
          <DialogDescription>
            {user
              ? "Atualize as informações do usuário"
              : "Preencha os dados para criar um novo usuário"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                />
              </div>

              {/* CPF aparece sempre na criação; no update permanece oculto por padrão */}
              {!user && (
                <div>
                  <Label>CPF *</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => handleInputChange("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
              )}

              <div>
                <Label>E-mail (Login) *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>
                  Senha {user && "(Deixe vazio para manter)"} {user ? "" : "*"}
                </Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required={!user}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cargo</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(v) =>
                      handleInputChange("role", v as RoleKey)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Gerente</SelectItem>
                      <SelectItem value="operator">Operador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.role === "manager" || formData.role === "operator") && (
                  <div>
                    <Label>Filial</Label>
                    <Select
                      value={formData.branchId}
                      onValueChange={(v) => handleInputChange("branchId", v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((b) => (
                          <SelectItem key={b.id} value={String(b.id)}>
                            {b.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
