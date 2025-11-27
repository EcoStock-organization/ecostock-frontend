"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Mail, Shield, Trash2, Edit, Power } from "lucide-react" // 1. Adicionado Power
import { useState } from "react"
import { mockUsers, mockBranches } from "@/lib/mock-data"
import type { User } from "@/lib/types"
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const { toast } = useToast()

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleSaveUser = (userData: Partial<User>) => {
    if (selectedUser) {
      // Update existing user
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, ...userData, updatedAt: new Date() } : u)))
    } else {
      // Create new user
      const newUser: User = {
        id: String(users.length + 1),
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true, // Default to active
      } as User
      setUsers([...users, newUser])
    }
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  // 2. Função para alternar o status
  const handleToggleStatus = (user: User) => {
    const newStatus = user.isActive === false ? true : false
    
    setUsers(users.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u)))
    
    toast({
      title: newStatus ? "Usuário ativado" : "Usuário desativado",
      description: `O acesso de ${user.name} foi ${newStatus ? "liberado" : "bloqueado"}.`,
      variant: newStatus ? "default" : "destructive", 
    })
  }

  const confirmDelete = () => {
    if (userToDelete) {
      setUsers(users.filter((u) => u.id !== userToDelete.id))
      toast({
        title: "Usuário excluído",
        description: `${userToDelete.name} foi removido do sistema`,
      })
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
        {/* Header */}
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

        <Card className="transition-smooth hover:shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("all")}
                className="transition-smooth"
              >
                Todos ({users.length})
              </Button>
              <Button
                variant={activeFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("active")}
                className="transition-smooth"
              >
                Ativos ({users.filter((u) => u.isActive !== false).length})
              </Button>
              <Button
                variant={activeFilter === "inactive" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveFilter("inactive")}
                className="transition-smooth"
              >
                Inativos ({users.filter((u) => u.isActive === false).length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Grid */}
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
                  {/* 3. Botão de Toggle Status adicionado */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className={
                            user.isActive !== false 
                              ? "text-green-600 hover:text-green-700 hover:bg-green-50" 
                              : "text-muted-foreground hover:text-foreground"
                          }
                          onClick={() => handleToggleStatus(user)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{user.isActive !== false ? "Desativar usuário" : "Ativar usuário"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent"
                    onClick={() => handleEditUser(user)}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 bg-transparent"
                    onClick={() => handleDeleteUser(user)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                {(user.role === "manager" || user.role === "operator") && user.branchId && (
                  <div className="text-xs text-muted-foreground pt-2 border-t">
                    <p>
                      <strong>Filial:</strong>{" "}
                      {mockBranches.find((b) => b.id === user.branchId)?.name || "Desconhecida"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {activeFilter === "all"
                  ? "Nenhum usuário cadastrado"
                  : `Nenhum usuário ${activeFilter === "active" ? "ativo" : "inativo"}`}
              </h3>
              <p className="text-muted-foreground mb-4">
                {activeFilter === "all"
                  ? "Comece adicionando o primeiro usuário ao sistema"
                  : `Nenhum usuário encontrado com o filtro selecionado`}
              </p>
              {activeFilter === "all" && (
                <Button onClick={handleAddUser}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Adicionar Usuário
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* User Form Modal */}
      <UserForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} user={selectedUser} onSave={handleSaveUser} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
