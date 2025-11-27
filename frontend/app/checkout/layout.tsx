import type React from "react"
import type { Metadata } from "next"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Frente de Caixa | EcoStock",
  description: "Ponto de Venda - Frente de Caixa",
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedRoute requiredRole="operator">{children}</ProtectedRoute>
}
