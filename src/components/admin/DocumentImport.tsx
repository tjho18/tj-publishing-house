'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { FileText, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface DetectedChapter { title: string; content: string }

function detectChapters(text: string): DetectedChapter[] {
  // Match common chapter headings:
  // "Chapter 1", "Chapter One", "CHAPTER I", "Chapter 1: Title", "1.", "Part I"
  // or Markdown "## Heading"
  const CHAPTER_RE = /^(?:chapter\s+(?:\d+|[ivxlcdm]+|one|two|three|four|five|six|seven|eight|nine|ten)\b[^\n]*|part\s+(?:\d+|[ivxlcdm]+|one|two|three)\b[^\n]*|#{1,3}\s+[^\n]+|\d+\.\s+[^\n]{1,80})/gim

  const matches = [...text.matchAll(CHAPTER_RE)]

  if (matches.length < 2) {
    // No clear chapters — treat whole text as one
    return [{ title: 'Chapter 1', content: text.trim() }]
  }

  return matches.map((match, i) => {
    const start = match.index! + match[0].length
    const end = matches[i + 1]?.index ?? text.length
    return {
      title: match[0].replace(/^#+\s*/, '').trim(),
      content: text.slice(start, end).trim(),
    }
  })
}

function textToTipTap(text: string) {
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
  return {
    type: 'doc',
    content: paragraphs.map(p => ({
      type: 'paragraph',
      content: [{ type: 'text', text: p.replace(/\n/g, ' ').trim() }],
    })),
  }
}

interface Props { workId: string }

export function DocumentImport({ workId }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [rawText, setRawText] = useState('')
  const [preview, setPreview] = useState<DetectedChapter[] | null>(null)
  const [importing, setImporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function handlePreview() {
    if (!rawText.trim()) return
    setPreview(detectChapters(rawText))
  }

  async function handleImport() {
    if (!preview) return
    setImporting(true)
    setError('')
    const supabase = createClient()

    // Get current max order_num
    const { data: existing } = await supabase
      .from('chapters')
      .select('order_num')
      .eq('work_id', workId)
      .order('order_num', { ascending: false })
      .limit(1)
      .single()

    let orderNum = existing ? (existing.order_num as number) + 1 : 1

    for (const ch of preview) {
      const slug = slugify(ch.title) || `chapter-${orderNum}`
      const content = textToTipTap(ch.content)
      const { error: err } = await supabase.from('chapters').insert({
        work_id: workId,
        title: ch.title,
        slug: `${slug}-${orderNum}`,
        order_num: orderNum,
        content,
        status: 'draft',
      })
      if (err) { setError(err.message); setImporting(false); return }
      orderNum++
    }

    setDone(true)
    setImporting(false)
    setRawText('')
    setPreview(null)
    router.refresh()
  }

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
    >
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-2">
          <FileText size={14} style={{ color: 'var(--text-muted)' }} />
          <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}>
            Import from document
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--text-faint)', fontFamily: "'Inter', sans-serif" }}>
            Paste Word / Google Docs
          </span>
        </div>
        {open ? <ChevronUp size={14} style={{ color: 'var(--text-faint)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-faint)' }} />}
      </button>

      {open && (
        <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {done ? (
            <div className="flex items-center gap-2 py-6 justify-center" style={{ color: 'var(--text-muted)' }}>
              <CheckCircle size={16} />
              <span className="text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                Chapters imported as drafts. Edit each one to publish.
              </span>
            </div>
          ) : (
            <>
              <p className="text-xs mt-3 mb-2" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}>
                Paste your full text. The importer detects chapter headings and splits automatically.
              </p>
              <textarea
                value={rawText}
                onChange={e => { setRawText(e.target.value); setPreview(null) }}
                rows={8}
                placeholder={'Chapter 1\n\nThe story begins here...\n\nChapter 2\n\nIt continues...'}
                className="w-full rounded-lg px-3 py-2.5 text-sm outline-none border mb-3"
                style={{
                  fontFamily: "'Lora', serif",
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                  resize: 'vertical',
                  fontSize: '0.85rem',
                  lineHeight: '1.7',
                }}
              />

              {!preview ? (
                <button
                  onClick={handlePreview}
                  disabled={!rawText.trim()}
                  className="text-sm px-4 py-2 rounded-full border hover:opacity-80 disabled:opacity-40 transition-opacity"
                  style={{ fontFamily: "'Inter', sans-serif", borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                >
                  Detect chapters
                </button>
              ) : (
                <div>
                  <p className="text-xs mb-2" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}>
                    Found {preview.length} chapter{preview.length !== 1 ? 's' : ''}:
                  </p>
                  <ul className="space-y-1 mb-4">
                    {preview.map((ch, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-xs w-5 text-right shrink-0" style={{ color: 'var(--text-faint)', fontFamily: "'Inter', sans-serif" }}>{i + 1}</span>
                        <span className="text-sm truncate" style={{ fontFamily: "'Lora', serif", color: 'var(--text)' }}>{ch.title}</span>
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-faint)', fontFamily: "'Inter', sans-serif" }}>
                          ~{ch.content.split(/\s+/).length} words
                        </span>
                      </li>
                    ))}
                  </ul>
                  {error && <p className="text-xs text-red-500 mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>}
                  <div className="flex gap-2">
                    <button
                      onClick={handleImport}
                      disabled={importing}
                      className="text-sm px-4 py-2 rounded-full font-medium hover:opacity-85 disabled:opacity-50 transition-opacity"
                      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'var(--text)', color: 'var(--bg)' }}
                    >
                      {importing ? 'Importing…' : `Import ${preview.length} chapter${preview.length !== 1 ? 's' : ''}`}
                    </button>
                    <button
                      onClick={() => setPreview(null)}
                      className="text-sm px-4 py-2 rounded-full hover:opacity-70 transition-opacity"
                      style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
                    >
                      Re-paste
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
