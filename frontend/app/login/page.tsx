"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Leaf } from "lucide-react"
import { authService } from "@/lib/auth" 

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const success = await login(email, password)
      
      if (success) {
        const currentUser = authService.getCurrentUser()
        console.log("[Login] Redirecionando cargo:", currentUser?.role)

        if (currentUser?.role === "operator") {
           router.push("/checkout")
        } else {
           router.push("/dashboard")
        }
      } else {
        setError("Email ou senha incorretos.")
      }
    } catch (err) {
      console.error(err)
      setError("Erro ao conectar com o servidor.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="bg-brand rounded-2xl p-4 transition-organic hover:scale-110 hover:rotate-6 shadow-lg">
              <Leaf className="h-10 w-10 text-white animate-leaf-float" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground font-display">EcoStock</h1>
            <p className="text-muted-foreground font-medium">Gestão Sustentável de Estoques</p>
          </div>
        </div>

        <Card className="border-2 border-border/60 transition-organic hover:shadow-xl shadow-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-foreground font-bold">Entrar</CardTitle>
            <CardDescription className="text-center text-muted-foreground font-medium">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="bg-destructive/10 border-2 border-destructive/40">
                  <AlertDescription className="text-destructive font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button type="submit" className="w-full bg-brand text-white hover:bg-brand/90" disabled={isLoading}>
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
