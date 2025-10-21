"use client"

import { memo } from "react"
import { ArrowLeft, Music } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DesktopLayout } from "@/components/desktop-layout"
import type { OszTrack } from "@/lib/music-config"

interface TrackSelectorProps {
  availableTracks: OszTrack[]
  isLoadingTracks: boolean
  onTrackSelect: (track: OszTrack) => void
  onBack: () => void
}

export const TrackSelector = memo(function TrackSelector({
  availableTracks,
  isLoadingTracks,
  onTrackSelect,
  onBack,
}: TrackSelectorProps) {
  return (
    <DesktopLayout maxWidth="xl">
      <div className="flex flex-col h-screen lg:h-auto bg-gradient-to-b from-background to-background/95">
        <div className="lg:hidden p-4 border-b border-border/50 flex items-center gap-3 backdrop-blur-xl bg-card/80">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="active:scale-95 transition-transform"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">Выбери трек</h1>
            <p className="text-xs text-muted-foreground">Выбери музыку для создания бита</p>
          </div>
        </div>

        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold mb-2">Выбери трек</h1>
          <p className="text-muted-foreground">Выбери музыку для создания бита</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-3 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
          {isLoadingTracks && (
            <div className="lg:col-span-2 flex items-center justify-center py-8">
              <div className="text-center space-y-2">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-sm text-muted-foreground">Загружаю треки...</p>
              </div>
            </div>
          )}

          {!isLoadingTracks && availableTracks.length === 0 && (
            <div className="lg:col-span-2 text-center py-8">
              <p className="text-muted-foreground">Нет доступных треков</p>
              <p className="text-xs text-muted-foreground mt-2">Загрузи треки в разделе "Загрузка музыки"</p>
            </div>
          )}

          {!isLoadingTracks &&
            availableTracks.map((track) => (
              <Card
                key={track.id}
                className="p-4 hover:bg-card/80 cursor-pointer transition-all active:scale-95"
                onClick={() => onTrackSelect(track)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      {track.artist} - {track.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{track.genre}</p>
                  </div>
                  <Music className="w-6 h-6 text-primary" />
                </div>
              </Card>
            ))}
        </div>
      </div>
    </DesktopLayout>
  )
})
