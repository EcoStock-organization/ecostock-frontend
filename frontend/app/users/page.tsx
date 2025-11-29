"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { UserPlus, Mail, Shield, Trash2, Edit, Power } from "lucide-react"
import { UserForm } from "@/components/users/user-form"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { coreApi } from "@/lib/api"
import type { User } from "@/lib/types"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const { toast } = useToast()

  const fetchUsers = async () => {
    setIsLoading(true)
    try {
      const response = await coreApi.get("/usuarios/")
      
      const mappedUsers: User[] = response.data.map((u: any) => ({
        id: u.id.toString(),
        name: u.nome_completo,
        email: u.email,
        role: u.cargo.toLowerCase(),
        branchId: u.filial,
        isActive: u.ativo,
      }))

      setUsers(mappedUsers)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleSaveSuccess = () => {
    fetchUsers() // Recarrega a lista
    setIsFormOpen(false)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  const handleToggleStatus = async (user: User) => {
    toast({ title: "Funcionalidade em desenvolvimento no backend" })
  }

  const confirmDelete = async () => {
    if (userToDelete) {
      try {
        await coreApi.delete(`/usuarios/${userToDelete.id}/`)
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id))
        toast({
          title: "Usuário excluído",
          description: `${userToDelete.name} foi removido do sistema`,
        })
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        })
      }
      setUserToDelete(null)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (activeFilter === "all") return true
    if (activeFilter === "active") return user.isActive !== false
    if (activeFilter === "inactive") return user.isActive === false
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Usuários</h1>
            <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={handleAddUser} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        {/* Filtros */}
        <Card className="transition-smooth hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button variant={activeFilter === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("all")}>
                Todos ({users.length})
              </Button>
              <Button variant={activeFilter === "active" ? "default" : "outline"} size="sm" onClick={() => setActiveFilter("active")}>
                Ativos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Grid */}
        {isLoading ? (
             <div className="text-center py-12">Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
            <Card className="text-center py-12">
                <CardContent>
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
                <Card key={user.id} className="hover-lift">
                <CardHeader>
                    <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full p-3 ${user.isActive !== false ? "bg-brand/10" : "bg-gray-100"}`}>
                        <Shield className={`h-5 w-5 ${user.isActive !== false ? "text-brand" : "text-gray-400"}`} />
                        </div>
                        <div>
                        <CardTitle className="text-lg">{user.name}</CardTitle>
                        <CardDescription className="capitalize">{user.role}</CardDescription>
                        </div>
                    </div>
                    <Badge variant={user.isActive !== false ? "default" : "secondary"} className="ml-2">
                        {user.isActive !== false ? "Ativo" : "Inativo"}
                    </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        {/* Botão de edição e exclusão apenas */}
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditUser(user)}>
                            <Edit className="h-3 w-3 mr-1" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive" onClick={() => handleDeleteUser(user)}>
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}

        <UserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} user={selectedUser} onSave={handleSaveSuccess} />

        <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                Tem certeza que deseja excluir <strong>{userToDelete?.name}</strong>? Essa ação removerá o acesso do usuário.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  )
}
