"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BranchCard } from "@/components/branches/branch-card"
import { BranchForm } from "@/components/branches/branch-form"
import { BranchStats } from "@/components/branches/branch-stats"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Building2 } from "lucide-react"
import { coreApi } from "@/lib/api"
import type { Branch, User } from "@/lib/types"

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | undefined>()

  const { toast } = useToast()

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [branchesRes, usersRes] = await Promise.all([
        coreApi.get("/filiais/"),
        coreApi.get("/usuarios/") 
      ])
      setBranches(branchesRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error("Erro ao buscar dados:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as filiais.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredBranches = branches.filter((branch) => {
    const matchesSearch =
      branch.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.logradouro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      branch.cidade.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && branch.esta_ativa) ||
      (statusFilter === "inactive" && !branch.esta_ativa)

    return matchesSearch && matchesStatus
  })

  const handleSaveBranch = () => {
    fetchData()
    setEditingBranch(undefined)
    setIsFormOpen(false)
  }

  const handleEditBranch = (branch: Branch) => {
    setEditingBranch(branch)
    setIsFormOpen(true)
  }

  const handleDeleteBranch = async (branchId: number) => {
    if (!confirm("Tem certeza que deseja excluir esta filial?")) return

    try {
      await coreApi.delete(`/filiais/${branchId}/`)
      setBranches((prev) => prev.filter((b) => b.id !== branchId))
      toast({
        title: "Filial removida",
        description: "A filial foi removida do sistema",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir filial.",
        variant: "destructive",
      })
    }
  }

  const handleNewBranch = () => {
    setEditingBranch(undefined)
    setIsFormOpen(true)
  }

  return (
    <DashboardLayout requiredRole="admin">
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Gestão de Filiais</h1>
          <p className="text-muted-foreground">Gerencie filiais, gerentes e configurações</p>
        </div>

        <BranchStats />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle>Filiais</CardTitle>
                <CardDescription>
                  {filteredBranches.length}{" "}
                  {filteredBranches.length === 1 ? "filial encontrada" : "filiais encontradas"}
                </CardDescription>
              </div>
              <Button onClick={handleNewBranch} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Filial
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar filiais..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Filiais</SelectItem>
                  <SelectItem value="active">Ativas</SelectItem>
                  <SelectItem value="inactive">Inativas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
            <div className="text-center py-12">Carregando filiais...</div>
        ) : filteredBranches.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Nenhuma filial encontrada</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando filiais ao sistema"}
              </p>
              <Button onClick={handleNewBranch}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeira Filial
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredBranches.map((branch) => (
              <BranchCard 
                key={branch.id} 
                branch={branch} 
                users={users}
                onEdit={handleEditBranch} 
                onDelete={handleDeleteBranch} 
              />
            ))}
          </div>
        )}

        <BranchForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          branch={editingBranch}
          onSave={handleSaveBranch}
          users={users}
        />
      </div>
    </DashboardLayout>
  )
}
