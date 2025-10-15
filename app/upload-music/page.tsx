"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function UploadMusicPage() {
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData(e.currentTarget)

    try {
      const response = await fetch("/api/upload-music", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Upload Music Files</h1>
          <p className="text-sm text-muted-foreground mt-1">Upload any file type</p>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <input
              type="file"
              name="file"
              required
              className="w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-4 bg-primary/10 border border-primary rounded-lg space-y-2">
            <p className="text-sm font-semibold text-primary">Upload successful!</p>
            <div className="text-xs space-y-1">
              <p>
                <span className="font-medium">Filename:</span> {result.filename}
              </p>
              <p>
                <span className="font-medium">Size:</span> {(result.size / 1024).toFixed(2)} KB
              </p>
              <p className="break-all">
                <span className="font-medium">URL:</span> {result.url}
              </p>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
