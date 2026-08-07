export interface Song {
  id: string | number
  title: string
  artist: string
  cover: string
  audio_file?: string
  duration: number
  plays: string | number
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}
