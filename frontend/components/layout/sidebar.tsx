"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Building2,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Leaf,
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager"],
  },
  {
    name: "Estoque",
    href: "/inventory",
    icon: Package,
    roles: ["admin", "manager"],
  },
  {
    name: "Vendas",
    href: "/sales",
    icon: ShoppingCart,
    roles: ["admin", "manager"],
  },
  {
    name: "Produtos",
    href: "/products",
    icon: Package,
    roles: ["admin"],
  },
  {
    name: "Filiais",
    href: "/branches",
    icon: Building2,
    roles: ["admin"],
  },
  {
    name: "Usuários",
    href: "/users",
    icon: Users,
    roles: ["admin"],
  },
  {
    name: "Relatórios",
    href: "/reports",
    icon: BarChart3,
    roles: ["admin", "manager"],
  },
]

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  if (user?.role === "operator") {
    return null
  }

  const filteredNavigation = navigation.filter((item) => item.roles.includes(user?.role || ""))

  return (
    <div
      className={cn(
        "flex flex-col bg-sidebar border-r-2 border-sidebar-border shadow-md",
        "transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        className,
      )}
    >
      <div className="flex items-center justify-between p-4 border-b-2 border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center space-x-2">
            <div className="bg-brand rounded-lg p-2 transition-organic hover:scale-110 hover:rotate-6 shadow-md">
              <Leaf className="h-5 w-5 text-white animate-leaf-float" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-sidebar-foreground font-display">EcoStock</h2>
              <p className="text-xs text-muted-foreground font-medium">Gestão Sustentável</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-brand transition-organic"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {!collapsed && user && (
        <div className="p-4 border-b-2 border-sidebar-border bg-sidebar-accent/50">
          <div className="flex items-center space-x-3">
            <div className="bg-brand rounded-full p-2 transition-organic hover:scale-110 shadow-md">
              <Users className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize font-medium">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "secondary" : "ghost"}
              className={cn(
                "w-full font-medium transition-all duration-300 ease-in-out",
                collapsed ? "px-0 justify-center" : "justify-start px-3",
                isActive
                  ? "bg-status-success/30 text-status-success hover:bg-status-success/40 shadow-sm border border-brand/20"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-status-success hover:shadow-sm",
                "hover-lift",
              )}
              onClick={() => router.push(item.href)}
            >
              <div
                className={cn(
                  "flex items-center justify-center transition-all duration-300",
                  collapsed && "w-10 h-10 rounded-full bg-gradient-radial from-sidebar-accent to-transparent",
                )}
              >
                <item.icon
                  className={cn("h-4 w-4 transition-all duration-300", collapsed ? "translate-x-[5px]" : "mr-3")}
                />
              </div>
              {!collapsed && <span>{item.name}</span>}
            </Button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t-2 border-sidebar-border">
        <Button
          variant="ghost"
          className={cn(
            "w-full font-medium transition-all duration-300 ease-in-out",
            collapsed ? "px-0 justify-center" : "justify-start px-3",
            "text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
          )}
          onClick={handleLogout}
        >
          <div
            className={cn(
              "flex items-center justify-center transition-all duration-300",
              collapsed && "w-10 h-10 rounded-full bg-gradient-radial from-sidebar-accent to-transparent",
            )}
          >
            <LogOut className={cn("h-4 w-4 transition-all duration-300", collapsed ? "translate-x-[5px]" : "mr-3")} />
          </div>
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </div>
  )
}
