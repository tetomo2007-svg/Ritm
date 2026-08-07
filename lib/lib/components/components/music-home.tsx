"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { SongCard } from "@/components/song-card"
import { PlayerBar } from "@/components/player-bar"
import { UploadSong } from "@/components/upload-song"
import { supabase } from "@/lib/supabase"
import type { Song } from "@/lib/songs"

export function MusicHome() {
  const [query, setQuery] = useState("")
  const [songs, setSongs] = useState<Song[]>([])
  const [currentId, setCurrentId] = useState<string | number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // جلب الأغاني من Supabase عند فتح الصفحة
  const fetchSongs = async () => {
    const { data, error } = await supabase.from("songs").select("*").order("created_at", { ascending: false })
    if (!error && data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        artist: item.genre || "فنان مستقل",
        cover: item.cover_image || "/placeholder.svg",
        audio_file: item.audio_file,
        duration: 180, // مدة افتراضية
        plays: item.plays || 0
      }))
      setSongs(formatted)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [])

  const currentSong = useMemo(() => songs.find((s) => s.id === currentId) ?? null, [currentId, songs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return songs
    return songs.filter((s) => s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
  }, [query, songs])

  // تشغيل الصوت الفعلي عبر عنصر HTML5 Audio
  useEffect(() => {
    if (currentSong?.audio_file) {
      if (!audioRef.current) {
        audioRef.current = new Audio(currentSong.audio_file)
      } else {
        audioRef.current.src = currentSong.audio_file
      }

      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false))
      } else {
        audioRef.current.pause()
      }
    }
  }, [currentSong, isPlaying])

  function playSong(song: Song) {
    if (song.id === currentId) {
      setIsPlaying((p) => !p)
    } else {
      setCurrentId(song.id)
      setProgress(0)
      setIsPlaying(true)
    }
  }

  function skip(direction: 1 | -1) {
    if (!currentSong || songs.length === 0) return
    const idx = songs.findIndex((s) => s.id === currentSong.id)
    const nextIdx = (idx + direction + songs.length) % songs.length
    setCurrentId(songs[nextIdx].id)
    setProgress(0)
    setIsPlaying(true)
  }

  return (
    <div className="min-h-screen pb-24">
      <Navbar query={query} onQueryChange={setQuery} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        <UploadSong onUploaded={fetchSongs} />

        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/20 via-card to-card px-6 py-12 sm:px-12 sm:py-16">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              منصة التوزيع الموسيقي الحديثة
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
              مكثفك الأول لاكتشاف ونشر الموسيقى.
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              استمع لأحدث الإصدارات، وقم برفع وتوزيع أغانيك الخاصة للجمهور مباشرة بكل سهولة.
            </p>
          </div>
        </section>

        {/* Trending */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold tracking-tight">الأغاني المتاحة</h2>
            </div>
          </div>

          {filtered.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((song) => (
                <SongCard key={song.id} song={song} isActive={song.id === currentId} isPlaying={isPlaying} onToggle={playSong} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
              لا توجد أغاني مرفوعة حتى الآن. ارفع أغنيتك الأولى بالأعلى!
            </p>
          )}
        </section>
      </main>

      <PlayerBar
        song={currentSong}
        isPlaying={isPlaying}
        progress={progress}
        onTogglePlay={() => currentSong && setIsPlaying((p) => !p)}
        onNext={() => skip(1)}
        onPrev={() => skip(-1)}
        onSeek={(s) => setProgress(s)}
      />
    </div>
  )
}
