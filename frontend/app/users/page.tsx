// Substitua o conteúdo de 'ecostock-frontend/frontend/app/users/page.tsx' por:

"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPlus, Mail, Shield, Trash2, Edit, Power, Building2 } from "lucide-react"
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
import { coreApi } from "@/lib/api"
import type { User, Branch } from "@/lib/types"

// Interface para tipar resposta do backend
interface BackendUser {
  id: number
  nome_completo: string
  email: string
  cargo: string
  filial: number | null
  ativo: boolean
  usuario_id_auth: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | undefined>()
  const [userToDelete, setUserToDelete] = useState<User | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  
  const { toast } = useToast()

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [usersRes, branchesRes] = await Promise.all([
        coreApi.get<BackendUser[]>("/usuarios/"),
        coreApi.get<Branch[]>("/filiais/")
      ])
      
      const mappedUsers: User[] = usersRes.data.map((u) => ({
        id: u.id.toString(),
        name: u.nome_completo,
        email: u.email || "Sem email", 
        role: u.cargo.toLowerCase() === "admin" ? "admin" : u.cargo.toLowerCase() === "gerente" ? "manager" : "operator",
        // CORREÇÃO: Converte null para undefined
        branchId: u.filial ?? undefined, 
        isActive: u.ativo,
      }))

      setUsers(mappedUsers)
      setBranches(branchesRes.data)

    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAddUser = () => {
    setSelectedUser(undefined)
    setIsFormOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleSaveSuccess = () => {
    fetchData()
    setIsFormOpen(false)
  }

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user)
  }

  const handleToggleStatus = async (user: User) => {
    try {
      await coreApi.patch(`/usuarios/${user.id}/`, { 
          ativo: !user.isActive,
      })
      
      toast({ title: "Status atualizado", description: `Usuário ${!user.isActive ? 'ativado' : 'desativado'} com sucesso.` })
      fetchData()
    } catch (error) {
      console.error(error)
      toast({ title: "Erro", description: "Não foi possível alterar o status.", variant: "destructive" })
    }
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
        console.error(error)
        toast({
          title: "Erro",
          description: "Não foi possível excluir o usuário.",
          variant: "destructive",
        })
      }
      setUserToDelete(null)
    }
  }

  const getBranchName = (id?: string | number) => {
      if (!id) return null
      const branch = branches.find(b => b.id.toString() === id.toString())
      return branch ? branch.nome : "Filial não encontrada"
  }

  const filteredUsers = users.filter((user) => {
    if (activeFilter === "all") return true
    if (activeFilter === "active") return user.isActive !== false
    if (activeFilter === "inactive") return user.isActive === false
    return true
  })

  return (
    <DashboardLayout>
      <div className="space-y-8 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-display">Usuários</h1>
            <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={handleAddUser} className="gap-2 bg-brand hover:bg-brand/90 text-white">
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </Button>
        </div>

        <div className="flex gap-2 bg-card p-1 rounded-lg border w-fit">
            <Button variant={activeFilter === "all" ? "default" : "ghost"} size="sm" onClick={() => setActiveFilter("all")} className="rounded-md">
            Todos ({users.length})
            </Button>
            <Button variant={activeFilter === "active" ? "default" : "ghost"} size="sm" onClick={() => setActiveFilter("active")} className="rounded-md text-green-700 bg-green-50 hover:bg-green-100 data-[state=active]:bg-green-600 data-[state=active]:text-white">
            Ativos
            </Button>
            <Button variant={activeFilter === "inactive" ? "default" : "ghost"} size="sm" onClick={() => setActiveFilter("inactive")} className="rounded-md text-muted-foreground">
            Inativos
            </Button>
        </div>

        {isLoading ? (
             <div className="text-center py-12 text-muted-foreground">Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
            <Card className="text-center py-12 border-dashed">
                <CardContent>
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
                </CardContent>
            </Card>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-brand">
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`rounded-full p-2.5 ${user.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                             <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-bold text-foreground">{user.name}</CardTitle>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-0.5">{user.role}</p>
                        </div>
                    </div>
                    <Badge 
                        className={user.isActive ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}
                    >
                        {user.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                    </div>
                </CardHeader>
                
                <CardContent className="space-y-4 pb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-md">
                        <Mail className="h-4 w-4 text-brand/70" />
                        <span className="truncate font-medium">{user.email}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Button 
                            variant="outline" 
                            size="icon" 
                            className={`h-9 w-9 border-input ${user.isActive ? 'text-green-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50' : 'text-muted-foreground hover:text-green-600'}`}
                            onClick={() => handleToggleStatus(user)}
                            title={user.isActive ? "Desativar usuário" : "Ativar usuário"}
                        >
                            <Power className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" className="flex-1 border-input hover:bg-muted/50" onClick={() => handleEditUser(user)}>
                            <Edit className="h-3.5 w-3.5 mr-2" /> Editar
                        </Button>

                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                            onClick={() => handleDeleteUser(user)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>

                {user.role !== 'admin' && user.branchId && (
                    <div className="px-6 py-3 bg-muted/30 border-t text-xs text-muted-foreground flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 opacity-70" />
                        <span>Filial: <strong className="text-foreground">{getBranchName(user.branchId)}</strong></span>
                    </div>
                )}
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
                Tem certeza que deseja excluir <strong>{userToDelete?.name}</strong>?
                Essa ação removerá o acesso do usuário permanentemente.
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