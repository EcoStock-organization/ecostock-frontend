"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, User, Edit, Trash2 } from "lucide-react"
import type { Branch } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"

interface BranchCardProps {
  branch: Branch
  onEdit: (branch: Branch) => void
  onDelete: (branchId: string) => void
}

export function BranchCard({ branch, onEdit, onDelete }: BranchCardProps) {
  const manager = mockUsers.find((user) => user.id === branch.managerId)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              {branch.name}
            </CardTitle>
            <Badge variant={branch.isActive ? "default" : "secondary"}>{branch.isActive ? "Ativa" : "Inativa"}</Badge>
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
              <p className="text-sm text-muted-foreground">{branch.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Gerente</p>
              <p className="text-sm text-muted-foreground">{manager?.name || "Não atribuído"}</p>
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground">Produtos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">R$ 0</p>
              <p className="text-xs text-muted-foreground">Vendas Hoje</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
