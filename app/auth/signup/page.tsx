"use client"

import type React from "react"

import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useState } from "react"
import { Music, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createBrowserClient()
    setIsLoading(true)
    setError(null)
    setSuccess(false)

    if (password !== repeatPassword) {
      setError("Пароли не совпадают")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Пароль должен быть минимум 6 символов")
      setIsLoading(false)
      return
    }

    try {
      console.log("[v0] Starting signup process for:", email)

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
        },
      })

      console.log("[v0] Signup response:", { data: signUpData, error: signUpError })

      if (signUpError) throw signUpError

      console.log("[v0] Attempting auto sign-in after signup")
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("[v0] Sign-in response:", { data: signInData, error: signInError })

      if (signInError) throw signInError

      setSuccess(true)
      console.log("[v0] Registration and login successful, redirecting in 2 seconds")

      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    } catch (error: unknown) {
      console.error("[v0] Auth error:", error)
      setError(error instanceof Error ? error.message : "Произошла ошибка")
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[oklch(0.15_0.02_250)] via-[oklch(0.12_0.03_280)] to-[oklch(0.1_0.04_260)] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[oklch(0.18_0.02_250)] border-[oklch(0.25_0.03_250)]">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Регистрация успешна!</h2>
                <p className="text-[oklch(0.7_0.05_250)]">Перенаправляем в игру...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
            <CardTitle className="text-2xl text-white">Регистрация</CardTitle>
            <CardDescription className="text-[oklch(0.65_0.05_250)]">Создайте аккаунт для игры</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup}>
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
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password" className="text-[oklch(0.8_0.05_250)]">
                    Повторите пароль
                  </Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
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
                  {isLoading ? "Создание аккаунта..." : "Зарегистрироваться"}
                </Button>
              </div>
              <div className="mt-6 text-center text-sm">
                <span className="text-[oklch(0.65_0.05_250)]">Уже есть аккаунт? </span>
                <Link
                  href="/auth/login"
                  className="text-[oklch(0.7_0.2_250)] hover:text-[oklch(0.75_0.2_250)] font-medium"
                >
                  Войти
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
