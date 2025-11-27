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
        if (email.toLowerCase().includes("pedro")) {
           router.push("/checkout")
        } else {
           router.push("/dashboard")
        }
      } else {
        setError("Email ou senha incorretos. Tente novamente.")
      }
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-slide-up">
        {/* Logo and Header */}
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

        {/* Login Form */}
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
                <Alert
                  variant="destructive"
                  className="bg-destructive/10 border-2 border-destructive/40 animate-slide-up"
                >
                  <AlertDescription className="text-destructive font-semibold">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-semibold">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background border-2 transition-organic focus:ring-2 focus:ring-brand focus:border-brand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-semibold">
                  Senha
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-background border-2 pr-10 transition-organic focus:ring-2 focus:ring-brand focus:border-brand"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent transition-organic"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-brand hover:bg-brand/90 transition-organic hover:scale-[1.02] hover:shadow-lg text-white font-bold shadow-md"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 border-2 border-border/40 rounded-lg transition-organic hover:bg-muted/70 shadow-sm">
              <p className="text-sm font-bold text-foreground mb-3">Credenciais de demonstração:</p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>
                  <strong className="text-foreground font-semibold">Admin:</strong> gustavo@supermarket.com / admin123
                </p>
                <p>
                  <strong className="text-foreground font-semibold">Gerente:</strong> maria@supermarket.com / manager123
                </p>
                <p>
                  <strong className="text-foreground font-semibold">Operador de Caixa:</strong> pedro@supermarket.com /
                  operator123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
