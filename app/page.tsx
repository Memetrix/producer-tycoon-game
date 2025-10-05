"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"

export default function ProducerTycoonPage() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Пожалуйста, введите описание персонажа")
      return
    }

    setIsGenerating(true)
    setError(null)
    setGeneratedImage(null)

    try {
      const response = await fetch("/api/generate-avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Ошибка при генерации аватара")
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-purple-600" />
            Producer Tycoon
          </h1>
          <p className="text-xl text-gray-600">Создайте уникального персонажа для вашей игры</p>
        </div>

        <Card className="p-8 shadow-2xl">
          <div className="space-y-6">
            <div>
              <Label htmlFor="prompt" className="text-lg font-semibold mb-2 block">
                Опишите вашего персонажа
              </Label>
              <Input
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Например: молодой музыкальный продюсер в студии, стильная одежда, наушники"
                className="text-lg p-6"
                disabled={isGenerating}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full text-lg py-6"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Генерация аватара...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Создать аватар
                </>
              )}
            </Button>

            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

            {generatedImage && (
              <div className="mt-8 space-y-4">
                <h3 className="text-2xl font-semibold text-center">Ваш персонаж готов!</h3>
                <div className="relative rounded-xl overflow-hidden shadow-2xl">
                  <img
                    src={generatedImage || "/placeholder.svg"}
                    alt="Сгенерированный аватар"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
