"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"

export function UploadSong({ onUploaded }: { onUploaded: () => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!audioFile || !title || !artist) return alert("الرجاء ملء الحقول الأساسية واختيار ملف الصوت")

    try {
      setUploading(true)

      // 1. رفع ملف الصوت
      const audioFileName = `${Date.now()}-${audioFile.name}`
      const { data: audioData, error: audioError } = await supabase.storage
        .from("music-files")
        .upload(audioFileName, audioFile)

      if (audioError) throw audioError

      // جلب رابط ملف الصوت العام
      const { data: audioPublicUrl } = supabase.storage
        .from("music-files")
        .getPublicUrl(audioFileName)

      // 2. رفع صورة الغلاف (إن وجدت)
      let coverUrl = "/placeholder.svg"
      if (coverFile) {
        const coverFileName = `${Date.now()}-${coverFile.name}`
        const { error: coverError } = await supabase.storage
          .from("music-files")
          .upload(coverFileName, coverFile)
        
        if (!coverError) {
          const { data: coverPublicUrl } = supabase.storage
            .from("music-files")
            .getPublicUrl(coverFileName)
          coverUrl = coverPublicUrl.publicUrl
        }
      }

      // 3. حفظ بيانات الأغنية في جدول songs
      const { error: dbError } = await supabase.from("songs").insert([
        {
          title,
          description: "Uploaded via web",
          audio_file: audioPublicUrl.publicUrl,
          cover_image: coverUrl,
          genre: "Pop",
          status: "published",
          plays: 0
        }
      ])

      if (dbError) throw dbError

      alert("تم رفع الأغنية بنجاح!")
      setIsOpen(false)
      setTitle("")
      setArtist("")
      setAudioFile(null)
      setCoverFile(null)
      onUploaded()
    } catch (error: any) {
      alert("حدث خطأ أثناء الرفع: " + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-8">
      <Button onClick={() => setIsOpen(!isOpen)} className="rounded-full bg-primary text-primary-foreground">
        <Upload className="mr-2 h-4 w-4" /> {isOpen ? "إغلاق نافذة الرفع" : "رفع أغنية جديدة"}
      </Button>

      {isOpen && (
        <form onSubmit={handleUpload} className="mt-4 rounded-2xl border border-border bg-card p-6 space-y-4 max-w-xl">
          <h3 className="text-lg font-bold">رفع مقطع موسيقي جديد</h3>
          <div>
            <label className="text-xs text-muted-foreground">عنوان الأغنية</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">اسم الفنان</label>
            <input type="text" value={artist} onChange={(e) => setArtist(e.target.value)} required className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">ملف الصوت (MP3)</label>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} required className="w-full text-sm text-muted-foreground mt-1" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">صورة الغلاف</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} className="w-full text-sm text-muted-foreground mt-1" />
          </div>
          <Button type="submit" disabled={uploading} className="w-full">
            {uploading ? <Loader2 className="animate-spin h-4 w-4" /> : "نشر الأغنية الآن"}
          </Button>
        </form>
      )}
    </div>
  )
}
