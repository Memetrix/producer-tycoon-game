export const DRUM_SOUNDS = {
  kick: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/music/kick.ogg",
  snare: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/music/snare.ogg",
  hat: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/music/hat.ogg",
  tom: "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/music/tom.ogg",
} as const

export interface OszTrack {
  id: string
  name: string
  artist: string
  genre: string
  type: "osz"
  oszUrl: string
}

export const OSZ_TRACKS: OszTrack[] = [
  {
    id: "freestyler",
    name: "Freestyler",
    artist: "Bomfunk MC's",
    genre: "Electronic",
    type: "osz",
    oszUrl:
      "https://0ugortr0sqpftx2e.public.blob.vercel-storage.com/music/35629%20Bomfunk%20MC%27s%20-%20Freestyler-7I5i2JFGpfgDIxwAsrjdz6nATwlLSg.osz",
  },
  {
    id: "infernal-pulse",
    name: "Infernal Pulse",
    artist: "Suno AI",
    genre: "Electronic",
    type: "osz",
    oszUrl: "/infernal-pulse.osz",
  },
]

export async function loadSongsFromDatabase(): Promise<OszTrack[]> {
  try {
    const response = await fetch("/api/songs")
    const data = await response.json()

    if (!data.songs) {
      return []
    }

    return data.songs.map((song: any) => ({
      id: song.id,
      name: song.name,
      artist: song.artist,
      genre: song.genre,
      type: "osz" as const,
      oszUrl: song.osz_url,
    }))
  } catch (error) {
    console.error("[v0] Failed to load songs from database:", error)
    return []
  }
}

export const ALL_TRACKS = OSZ_TRACKS

export const MUSIC_TRACKS = ALL_TRACKS

export type MusicTrack = OszTrack
