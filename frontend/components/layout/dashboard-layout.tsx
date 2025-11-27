"use client"

import type React from "react"

import { Sidebar } from "./sidebar"
import { ProtectedRoute } from "@/components/protected-route"

interface DashboardLayoutProps {
  children: React.ReactNode
  requiredRole?: "admin" | "manager"
}

export function DashboardLayout({ children, requiredRole }: DashboardLayoutProps) {
  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <div className="flex h-screen bg-background bg-organic-pattern">
        <Sidebar />
        <main className="flex-1 overflow-auto relative z-10 p-8">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
