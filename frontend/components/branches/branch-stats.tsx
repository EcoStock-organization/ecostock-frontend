"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, TrendingUp, AlertCircle } from "lucide-react"
import type { Branch, User } from "@/lib/types"

interface BranchStatsProps {
  branches: Branch[]
  users: User[]
}

export function BranchStats({ branches, users }: BranchStatsProps) {
  const totalBranches = branches.length
  const activeBranches = branches.filter((branch) => branch.esta_ativa).length
  const inactiveBranches = totalBranches - activeBranches
  
  const managersAssigned = users.filter((user) => user.role === "manager" && user.branchId).length

  const stats = [
    {
      title: "Total de Filiais",
      value: totalBranches,
      icon: Building2,
      description: "Filiais cadastradas",
    },
    {
      title: "Filiais Ativas",
      value: activeBranches,
      icon: TrendingUp,
      description: "Em funcionamento",
      color: "text-green-600",
    },
    {
      title: "Gerentes Atribuídos",
      value: managersAssigned,
      icon: Users,
      description: "Gerentes com filiais",
    },
    {
      title: "Filiais Inativas",
      value: inactiveBranches,
      icon: AlertCircle,
      description: "Temporariamente fechadas",
      color: "text-yellow-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color || "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.color || "text-foreground"}`}>{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}