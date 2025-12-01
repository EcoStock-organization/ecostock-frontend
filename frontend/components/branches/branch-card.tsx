"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, User as UserIcon, Edit, Trash2 } from "lucide-react"
import type { Branch, User } from "@/lib/types"

interface BranchCardProps {
  branch: Branch
  users: User[]
  onEdit: (branch: Branch) => void
  onDelete: (branchId: number) => void
}

export function BranchCard({ branch, users, onEdit, onDelete }: BranchCardProps) {
  const manager = users.find((user) => Number(user.id) === branch.gerente_id)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {branch.nome}
            </CardTitle>
            <Badge variant={branch.esta_ativa ? "default" : "secondary"}>
              {branch.esta_ativa ? "Ativa" : "Inativa"}
            </Badge>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(branch)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(branch.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium">Endereço</p>
              <p className="text-sm text-muted-foreground">
                {branch.logradouro}, {branch.cidade} - {branch.estado}
              </p>
              <p className="text-xs text-muted-foreground">CEP: {branch.cep}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <UserIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Gerente</p>
              <p className="text-sm text-muted-foreground">
                {manager ? manager.name : branch.gerente_id ? `ID: ${branch.gerente_id}` : "Não atribuído"}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">{branch.total_produtos || 0}</p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{branch.total_vendas || 0}</p>
              <p className="text-xs text-muted-foreground">Vendas</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
