"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function TestAIPage() {
  const [trackName, setTrackName] = useState("Feel Good Inc.")
  const [artistName, setArtistName] = useState("Gorillaz")
  const [beatName, setBeatName] = useState("")
  const [coverUrl, setCoverUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const testBeatName = async () => {
    setLoading(true)
    setError("")
    setBeatName("")

    try {
      console.log("[v0] Testing beat name generation for:", trackName, "by", artistName)
      const response = await fetch("/api/generate-beat-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalTrackName: trackName,
          artistName: artistName,
        }),
      })

      console.log("[v0] Beat name API response status:", response.status)

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`API error: ${response.status} - ${text}`)
      }

      const data = await response.json()
      console.log("[v0] Beat name generated:", data.beatName)
      setBeatName(data.beatName)
    } catch (err: any) {
      console.error("[v0] Beat name generation error:", err)
      setError(`Beat name error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const testCoverArt = async () => {
    setLoading(true)
    setError("")
    setCoverUrl("")

    try {
      console.log("[v0] Testing cover art generation for:", beatName || "Test Beat")
      const response = await fetch("/api/generate-beat-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatName: beatName || "Test Beat" }),
      })

      console.log("[v0] Cover art API response status:", response.status)

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`API error: ${response.status} - ${text}`)
      }

      const data = await response.json()
      console.log("[v0] Cover art generated:", data.coverUrl)
      setCoverUrl(data.coverUrl)
    } catch (err: any) {
      console.error("[v0] Cover art generation error:", err)
      setError(`Cover art error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-white">AI Generation Test</h1>

        <Card className="p-6 bg-zinc-900 border-zinc-800">
          <div className="space-y-4">
            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Track Name</label>
              <Input
                value={trackName}
                onChange={(e) => setTrackName(e.target.value)}
                placeholder="Enter track name..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-400 mb-2 block">Artist Name</label>
              <Input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Enter artist name..."
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={testBeatName} disabled={loading || !trackName} className="flex-1">
                {loading ? "Testing..." : "Test Beat Name"}
              </Button>

              <Button onClick={testCoverArt} disabled={loading || !trackName} variant="secondary" className="flex-1">
                {loading ? "Testing..." : "Test Cover Art"}
              </Button>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {beatName && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-xs text-green-400 mb-1">Beat Name:</p>
                <p className="text-white font-medium">{beatName}</p>
              </div>
            )}

            {coverUrl && (
              <div className="space-y-2">
                <p className="text-xs text-green-400">Cover Art Generated:</p>
                <img
                  src={coverUrl || "/default-beat-cover.svg"}
                  alt="Generated cover"
                  className="w-full rounded-lg border border-zinc-700"
                />
                <p className="text-xs text-zinc-500 break-all">{coverUrl}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="text-center">
          <a href="/" className="text-blue-400 hover:text-blue-300 text-sm">
            ← Back to Game
          </a>
        </div>
      </div>
    </div>
  )
}
