'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Work, WorkType, WorkStatus } from '@/lib/types'
import { slugify } from '@/lib/utils'
import { Upload, X } from 'lucide-react'
import Image from 'next/image'

interface Props {
  work?: Work
}

const inputClass = 'w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border focus:ring-1 transition-colors'
const inputStyle = {
  fontFamily: "'Inter', sans-serif",
  backgroundColor: 'var(--bg)',
  color: 'var(--text)',
  borderColor: 'var(--border)',
}

const labelStyle = {
  fontFamily: "'Inter', sans-serif",
  color: 'var(--text-muted)',
}

export function WorkForm({ work }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(work?.title ?? '')
  const [type, setType] = useState<WorkType>(work?.type ?? 'novel')
  const [description, setDescription] = useState(work?.description ?? '')
  const [status, setStatus] = useState<WorkStatus>(work?.status ?? 'draft')
  const [featured, setFeatured] = useState(work?.featured ?? false)
  const [coverUrl, setCoverUrl] = useState(work?.cover_image_url ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function uploadCover(file: File) {
    setUploading(true)
    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('covers').upload(path, file)
    if (upErr) { setError(upErr.message); setUploading(false); return }
    const { data } = supabase.storage.from('covers').getPublicUrl(path)
    setCoverUrl(data.publicUrl)
    setUploading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSaving(true)
    const supabase = createClient()
    const slug = work?.slug ?? slugify(title)

    if (work) {
      const { error } = await supabase
        .from('works')
        .update({ title, type, description, status, featured, cover_image_url: coverUrl || null })
        .eq('id', work.id)
      if (error) { setError(error.message); setSaving(false); return }
      router.refresh()
      router.push(`/admin/works/${work.id}`)
    } else {
      const { data, error } = await supabase
        .from('works')
        .insert({ title, slug, type, description, status, featured, cover_image_url: coverUrl || null })
        .select('id')
        .single()
      if (error) { setError(error.message); setSaving(false); return }
      router.push(`/admin/works/${data.id}`)
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-xs mb-1.5 uppercase tracking-widest" style={labelStyle}>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          placeholder="Untitled"
          className={inputClass}
          style={inputStyle}
        />
        {title && (
          <p className="text-xs mt-1" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}>
            Slug: <span style={{ color: 'var(--text-muted)' }}>{slugify(title)}</span>
          </p>
        )}
      </div>

      {/* Type */}
      <div>
        <label className="block text-xs mb-1.5 uppercase tracking-widest" style={labelStyle}>Type</label>
        <div className="flex gap-2">
          {(['novel', 'story', 'essay'] as WorkType[]).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className="flex-1 py-2 rounded-lg text-sm capitalize border transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: type === t ? 'var(--accent)' : 'var(--bg)',
                color: type === t ? 'var(--bg)' : 'var(--text-muted)',
                borderColor: type === t ? 'var(--accent)' : 'var(--border)',
              }}
            >
              {t === 'story' ? 'Short Story' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs mb-1.5 uppercase tracking-widest" style={labelStyle}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="A brief synopsis or blurb…"
          className={inputClass}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Cover image */}
      <div>
        <label className="block text-xs mb-1.5 uppercase tracking-widest" style={labelStyle}>Cover Image</label>
        {coverUrl ? (
          <div className="relative w-32 h-44">
            <Image src={coverUrl} alt="Cover" fill className="object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setCoverUrl('')}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-opacity hover:opacity-80 disabled:opacity-50"
            style={{
              fontFamily: "'Inter', sans-serif",
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg)',
            }}
          >
            <Upload size={14} />
            {uploading ? 'Uploading…' : 'Upload cover'}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { if (e.target.files?.[0]) uploadCover(e.target.files[0]) }}
        />
      </div>

      {/* Status & Featured */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-40">
          <label className="block text-xs mb-1.5 uppercase tracking-widest" style={labelStyle}>Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as WorkStatus)}
            className={inputClass}
            style={inputStyle}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>
              Featured on homepage
            </span>
          </label>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="w-full py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
        style={{
          fontFamily: "'Inter', sans-serif",
          backgroundColor: 'var(--accent)',
          color: 'var(--bg)',
        }}
      >
        {saving ? 'Saving…' : work ? 'Save changes' : 'Create work'}
      </button>
    </form>
  )
}
