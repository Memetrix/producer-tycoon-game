"use client"

import type React from "react"

import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Music } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()
    setIsLoading(true)
    setError(null)

    try {
      console.log("[v0] Attempting login for:", email)

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Login response:", { data, error })

      if (error) throw error

      console.log("[v0] Login successful, redirecting to home")
      window.location.href = "/"
    } catch (error: unknown) {
      console.error("[v0] Login error:", error)
      setError(error instanceof Error ? error.message : "Произошла ошибка")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.02_250)] via-[oklch(0.12_0.03_280)] to-[oklch(0.1_0.04_260)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[oklch(0.65_0.25_250)] to-[oklch(0.55_0.25_280)] flex items-center justify-center shadow-lg">
            <Music className="w-10 h-10 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">Producer Tycoon</h1>
            <p className="text-[oklch(0.7_0.05_250)]">Создавай биты, зарабатывай деньги</p>
          </div>
        </div>

        <Card className="bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.03_250)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Вход</CardTitle>
            <CardDescription className="text-[oklch(0.65_0.05_250)]">Введите email и пароль для входа</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[oklch(0.8_0.05_250)]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="producer@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.3_0.03_250)] text-white placeholder:text-[oklch(0.5_0.05_250)]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-[oklch(0.8_0.05_250)]">
                    Пароль
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-[oklch(0.15_0.02_250)] border-[oklch(0.3_0.03_250)] text-white"
                  />
                </div>
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[oklch(0.65_0.25_250)] to-[oklch(0.55_0.25_280)] hover:from-[oklch(0.7_0.25_250)] hover:to-[oklch(0.6_0.25_280)] text-white font-semibold"
                  disabled={isLoading}
                >
                  {isLoading ? "Вход..." : "Войти"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <span className="text-[oklch(0.65_0.05_250)]">Нет аккаунта? </span>
                <Link
                  href="/auth/signup"
                  className="text-[oklch(0.7_0.2_250)] hover:text-[oklch(0.75_0.2_250)] font-medium"
                >
                  Зарегистрироваться
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
