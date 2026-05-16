'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { Upload, X, Check } from 'lucide-react'

export function SettingsForm({ initialPhotoUrl }: { initialPhotoUrl: string }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function uploadPhoto(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `about/photo-${Date.now()}.${ext}`
    await supabase.storage.from('covers').upload(path, file)
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    setPhotoUrl(data.publicUrl)
    setUploading(false)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    await supabase
      .from('settings')
      .upsert({ key: 'about_photo_url', value: photoUrl, updated_at: new Date().toISOString() })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <label
          className="block text-xs mb-3 uppercase tracking-widest"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
        >
          About page photo
        </label>

        {photoUrl ? (
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2"
              style={{ borderColor: 'var(--border)' }}>
              <Image src={photoUrl} alt="About photo" fill className="object-cover" />
            </div>
            <button
              onClick={() => setPhotoUrl('')}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:opacity-70 transition-opacity"
              style={{ fontFamily: "'Inter', sans-serif", borderColor: 'var(--border)', color: 'var(--text-muted)' }}
            >
              <X size={12} /> Remove
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{ fontFamily: "'Inter', sans-serif", borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Upload photo'}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) uploadPhoto(e.target.files[0]) }}
        />
      </div>

      <button
        onClick={save}
        disabled={saving || uploading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
        style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'var(--text)', color: 'var(--bg)' }}
      >
        {saved ? <><Check size={14} /> Saved</> : saving ? 'Saving…' : 'Save settings'}
      </button>
    </div>
  )
}
