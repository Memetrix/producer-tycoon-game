"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, RefreshCw, Check, Download } from "lucide-react"

interface ArtAsset {
  category: string
  name: string
  filename: string
  prompt: string
  size: string
  format: string
  priority: string
  generatedUrl?: string
  blobUrl?: string
  status: "pending" | "generating" | "generated" | "approved" | "rejected"
  selected: boolean
}

export default function ArtGeneratorPage() {
  const [assets, setAssets] = useState<ArtAsset[]>([])
  const [loading, setLoading] = useState(false)
  const [currentBatch, setCurrentBatch] = useState(0)
  const [filter, setFilter] = useState<string>("all")
  const [progress, setProgress] = useState(0)
  const BATCH_SIZE = 10

  // Load CSV data on mount
  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    setLoading(true)
    try {
      console.log("[v0] Loading CSV files...")

      // Load all CSV files
      const responses = await Promise.all([
        fetch("/art-assets-01-equipment.csv"),
        fetch("/art-assets-02-artists.csv"),
        fetch("/art-assets-03-ui-elements.csv"),
        fetch("/art-assets-04-backgrounds.csv"),
      ])

      // Check if all responses are OK
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          console.error(`[v0] Failed to load CSV file ${i + 1}:`, responses[i].status, responses[i].statusText)
        }
      }

      const csvTexts = await Promise.all(responses.map((r) => r.text()))

      // Log first 100 chars of each CSV to verify content
      csvTexts.forEach((csv, i) => {
        console.log(`[v0] CSV ${i + 1} preview:`, csv.substring(0, 100))
      })

      const allAssets: ArtAsset[] = []

      csvTexts.forEach((csv, csvIndex) => {
        const lines = csv.split("\n")
        const header = lines[0]
        console.log(`[v0] CSV ${csvIndex + 1} header:`, header)
        console.log(`[v0] CSV ${csvIndex + 1} has ${lines.length - 1} data lines`)

        lines.slice(1).forEach((line, lineIndex) => {
          if (!line.trim()) return

          // Parse CSV line respecting quotes
          const fields: string[] = []
          let current = ""
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === "," && !inQuotes) {
              fields.push(current.trim())
              current = ""
            } else {
              current += char
            }
          }
          fields.push(current.trim())

          let category, name, filename, prompt, size, format, priority

          // Equipment CSV: Category,Item,Level,Filename,Size,Format,Priority,Prompt
          if (csvIndex === 0) {
            ;[category, name, , filename, size, format, priority, prompt] = fields
          }
          // Artists, UI, Backgrounds CSV: Category,Item,Quantity,Size,Format,Prompt,Filename,Priority
          else {
            ;[category, name, , size, format, prompt, filename, priority] = fields
          }

          if (!category || !name || !filename || !prompt) {
            console.warn(`[v0] Skipping invalid line ${lineIndex + 1} in CSV ${csvIndex + 1}:`, {
              category,
              name,
              filename,
              hasPrompt: !!prompt,
              fields: fields.length,
            })
            return
          }

          allAssets.push({
            category,
            name,
            filename,
            prompt,
            size: size || "1024x1024",
            format: format || "jpg",
            priority: priority || "MEDIUM",
            status: "pending",
            selected: false,
          })
        })
      })

      console.log("[v0] Successfully loaded", allAssets.length, "assets")
      console.log("[v0] Sample asset:", allAssets[0])
      setAssets(allAssets)
    } catch (error) {
      console.error("[v0] Failed to load assets:", error)
      alert("Failed to load CSV files. Check console for details.")
    } finally {
      setLoading(false)
    }
  }

  const generateBatch = async () => {
    const startIdx = currentBatch * BATCH_SIZE
    const endIdx = Math.min(startIdx + BATCH_SIZE, assets.length)
    const batch = assets.slice(startIdx, endIdx)

    setLoading(true)
    setProgress(0)

    for (let i = 0; i < batch.length; i++) {
      const asset = batch[i]
      const assetIndex = startIdx + i

      // Update status to generating
      setAssets((prev) => {
        const updated = [...prev]
        updated[assetIndex].status = "generating"
        return updated
      })

      try {
        // Generate image via API
        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: asset.prompt,
            size: asset.size,
            filename: asset.filename,
          }),
        })

        const data = await response.json()

        // Update with generated image
        setAssets((prev) => {
          const updated = [...prev]
          updated[assetIndex].generatedUrl = data.url
          updated[assetIndex].status = "generated"
          return updated
        })
      } catch (error) {
        console.error(`[v0] Failed to generate ${asset.filename}:`, error)
        setAssets((prev) => {
          const updated = [...prev]
          updated[assetIndex].status = "rejected"
          return updated
        })
      }

      setProgress(((i + 1) / batch.length) * 100)
    }

    setLoading(false)
    setCurrentBatch((prev) => prev + 1)
  }

  const regenerateSelected = async () => {
    const selected = assets.filter((a) => a.selected)
    if (selected.length === 0) return

    setLoading(true)
    setProgress(0)

    for (let i = 0; i < selected.length; i++) {
      const asset = selected[i]
      const assetIndex = assets.findIndex((a) => a.filename === asset.filename)

      setAssets((prev) => {
        const updated = [...prev]
        updated[assetIndex].status = "generating"
        return updated
      })

      try {
        const response = await fetch("/api/generate-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: asset.prompt,
            size: asset.size,
            filename: asset.filename,
          }),
        })

        const data = await response.json()

        setAssets((prev) => {
          const updated = [...prev]
          updated[assetIndex].generatedUrl = data.url
          updated[assetIndex].status = "generated"
          updated[assetIndex].selected = false
          return updated
        })
      } catch (error) {
        console.error(`[v0] Failed to regenerate ${asset.filename}:`, error)
      }

      setProgress(((i + 1) / selected.length) * 100)
    }

    setLoading(false)
  }

  const approveSelected = async () => {
    const selected = assets.filter((a) => a.selected && a.generatedUrl)
    if (selected.length === 0) return

    setLoading(true)

    for (const asset of selected) {
      const assetIndex = assets.findIndex((a) => a.filename === asset.filename)

      try {
        // Upload to Blob storage
        const response = await fetch("/api/upload-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: asset.generatedUrl,
            filename: asset.filename,
          }),
        })

        const data = await response.json()

        setAssets((prev) => {
          const updated = [...prev]
          updated[assetIndex].blobUrl = data.blobUrl
          updated[assetIndex].status = "approved"
          updated[assetIndex].selected = false
          return updated
        })
      } catch (error) {
        console.error(`[v0] Failed to upload ${asset.filename}:`, error)
      }
    }

    setLoading(false)
  }

  const rejectSelected = () => {
    setAssets((prev) => prev.map((a) => (a.selected ? { ...a, status: "rejected", selected: false } : a)))
  }

  const toggleSelect = (filename: string) => {
    setAssets((prev) => prev.map((a) => (a.filename === filename ? { ...a, selected: !a.selected } : a)))
  }

  const toggleSelectAll = () => {
    const filtered = getFilteredAssets()
    const allSelected = filtered.every((a) => a.selected)
    setAssets((prev) => prev.map((a) => (filtered.includes(a) ? { ...a, selected: !allSelected } : a)))
  }

  const getFilteredAssets = () => {
    if (filter === "all") return assets
    return assets.filter((a) => a.category === filter)
  }

  const filteredAssets = getFilteredAssets()
  const selectedCount = filteredAssets.filter((a) => a.selected).length
  const stats = {
    total: assets.length,
    pending: assets.filter((a) => a.status === "pending").length,
    generated: assets.filter((a) => a.status === "generated").length,
    approved: assets.filter((a) => a.status === "approved").length,
    rejected: assets.filter((a) => a.status === "rejected").length,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🎨 Art Generator Admin</h1>
          <p className="text-slate-300">Generate and manage all game art assets with visual consistency checking</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <div className="text-sm text-slate-400">Total Assets</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
            <div className="text-sm text-slate-400">Pending</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-2xl font-bold text-blue-400">{stats.generated}</div>
            <div className="text-sm text-slate-400">Generated</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-2xl font-bold text-green-400">{stats.approved}</div>
            <div className="text-sm text-slate-400">Approved</div>
          </Card>
          <Card className="p-4 bg-slate-800/50 border-slate-700">
            <div className="text-2xl font-bold text-red-400">{stats.rejected}</div>
            <div className="text-sm text-slate-400">Rejected</div>
          </Card>
        </div>

        {/* Controls */}
        <Card className="p-6 mb-6 bg-slate-800/50 border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <Button
                onClick={generateBatch}
                disabled={loading || currentBatch * BATCH_SIZE >= assets.length}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Generate Next {BATCH_SIZE}
              </Button>
              <Button
                onClick={regenerateSelected}
                disabled={loading || selectedCount === 0}
                variant="outline"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/10 bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Selected ({selectedCount})
              </Button>
              <Button
                onClick={approveSelected}
                disabled={loading || selectedCount === 0}
                variant="outline"
                className="border-green-500 text-green-400 hover:bg-green-500/10 bg-transparent"
              >
                <Check className="w-4 h-4 mr-2" />
                Approve & Upload ({selectedCount})
              </Button>
              <Button
                onClick={rejectSelected}
                disabled={loading || selectedCount === 0}
                variant="outline"
                className="border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Reject Selected ({selectedCount})
              </Button>
            </div>

            <div className="flex gap-2">
              <Button onClick={toggleSelectAll} variant="outline" size="sm" className="border-slate-600 bg-transparent">
                {filteredAssets.every((a) => a.selected) ? "Deselect All" : "Select All"}
              </Button>
            </div>
          </div>

          {loading && (
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-slate-400 mt-2">Processing... {Math.round(progress)}%</p>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            {["all", "Equipment", "Artists", "Skills", "Contracts", "Labels", "Achievements", "Backgrounds"].map(
              (cat) => (
                <Button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  variant={filter === cat ? "default" : "outline"}
                  size="sm"
                  className={filter === cat ? "bg-purple-600" : "border-slate-600 text-slate-300"}
                >
                  {cat}
                </Button>
              ),
            )}
          </div>
        </Card>

        {/* Asset Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <Card
              key={asset.filename}
              className={`p-3 bg-slate-800/50 border-2 transition-all ${
                asset.selected ? "border-purple-500 shadow-lg shadow-purple-500/20" : "border-slate-700"
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-square mb-2 bg-slate-900 rounded-lg overflow-hidden">
                {asset.generatedUrl ? (
                  <img
                    src={asset.generatedUrl || "/placeholder.svg"}
                    alt={asset.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎨</div>
                      <div className="text-xs">Not Generated</div>
                    </div>
                  </div>
                )}

                {/* Checkbox */}
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={asset.selected}
                    onCheckedChange={() => toggleSelect(asset.filename)}
                    className="bg-white/90 border-2"
                  />
                </div>

                {/* Status Badge */}
                <div className="absolute top-2 right-2">
                  <Badge
                    className={
                      asset.status === "approved"
                        ? "bg-green-500"
                        : asset.status === "generated"
                          ? "bg-blue-500"
                          : asset.status === "generating"
                            ? "bg-yellow-500 animate-pulse"
                            : asset.status === "rejected"
                              ? "bg-red-500"
                              : "bg-slate-600"
                    }
                  >
                    {asset.status}
                  </Badge>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-white text-sm truncate">{asset.name}</h3>
                <p className="text-xs text-slate-400 truncate">{asset.filename}</p>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {asset.prompt ? asset.prompt.substring(0, 80) + "..." : "No prompt"}
                </p>
                <div className="flex gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {asset.size}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      asset.priority === "HIGH"
                        ? "border-red-500 text-red-400"
                        : asset.priority === "MEDIUM"
                          ? "border-yellow-500 text-yellow-400"
                          : "border-slate-500 text-slate-400"
                    }`}
                  >
                    {asset.priority}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
