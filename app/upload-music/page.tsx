"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Music, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface UploadedSong {
  id: string
  name: string
  artist: string
  url: string
  size: number
}

export default function UploadMusicPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedSongs, setUploadedSongs] = useState<UploadedSong[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setSelectedFiles(files)
    setError(null)
  }

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (selectedFiles.length === 0) {
      setError("Please select at least one file")
      return
    }

    setUploading(true)
    setError(null)
    setUploadedSongs([])

    const formData = new FormData()
    selectedFiles.forEach((file) => {
      formData.append("files", file)
    })

    try {
      const response = await fetch("/api/upload-music", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Upload failed")
      }

      setUploadedSongs(data.songs)
      setSelectedFiles([])

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      if (fileInput) fileInput.value = ""
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Music className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Upload Music Files</h1>
            <p className="text-sm text-muted-foreground">Upload .osz beatmap files to add them to the game</p>
          </div>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <input
              type="file"
              name="files"
              multiple
              accept=".osz"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Click to select files or drag and drop
              <br />
              <span className="text-xs">Supports multiple .osz files</span>
            </label>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected files ({selectedFiles.length}):</p>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-muted rounded"
                  >
                    <Music className="w-4 h-4" />
                    <span className="flex-1 truncate">{file.name}</span>
                    <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button type="submit" disabled={uploading || selectedFiles.length === 0} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading {selectedFiles.length} file(s)...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : "Files"}
              </>
            )}
          </Button>
        </form>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-destructive">Upload failed</p>
              <p className="text-xs text-destructive/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {uploadedSongs.length > 0 && (
          <div className="p-4 bg-primary/10 border border-primary rounded-lg space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <p className="text-sm font-semibold text-primary">
                Successfully uploaded {uploadedSongs.length} song(s)!
              </p>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {uploadedSongs.map((song) => (
                <div key={song.id} className="text-xs space-y-1 p-3 bg-background rounded border">
                  <p className="font-semibold">{song.name}</p>
                  <p className="text-muted-foreground">{song.artist}</p>
                  <p className="text-muted-foreground">Size: {(song.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
