"use client"

import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, Leaf } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { User, Branch } from "@/lib/types"

interface CheckoutHeaderProps {
  user: User
  branch?: Branch
}

export function CheckoutHeader({ user, branch }: CheckoutHeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="bg-card shadow-sm border-b border-status-success/30 px-6 py-4">
      <div className="flex items-center justify-between max-w-full">
        <div className="flex items-center gap-3">
          <div className="bg-status-success rounded-lg p-2">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-display">EcoStock - Frente de Caixa</h1>
            <p className="text-sm text-muted-foreground">
              {user.name} • {branch?.name || "Filial"}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2 border-status-success/30 text-status-success hover:bg-status-success/10 bg-transparent"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </Button>
      </div>
    </header>
  )
}
