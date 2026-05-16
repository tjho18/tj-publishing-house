'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Globe, EyeOff, Loader } from 'lucide-react'

interface Props {
  workId: string
  currentStatus: 'draft' | 'published'
  wasPublished: boolean // track if it was already published before
}

export function OneClickPublish({ workId, currentStatus, wasPublished }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(currentStatus)

  async function togglePublish() {
    setLoading(true)
    const supabase = createClient()
    const newStatus = status === 'published' ? 'draft' : 'published'

    // Update work status
    await supabase.from('works').update({ status: newStatus }).eq('id', workId)

    // Update ALL chapters to match
    await supabase.from('chapters').update({ status: newStatus }).eq('work_id', workId)

    // If newly publishing (wasn't published before), send announcement email
    if (newStatus === 'published' && !wasPublished) {
      try {
        await fetch('/api/announce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workId }),
        })
      } catch {
        // Non-fatal — email failure shouldn't block publish
      }
    }

    setStatus(newStatus)
    setLoading(false)
    router.refresh()
  }

  const isPublished = status === 'published'

  return (
    <button
      onClick={togglePublish}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all hover:opacity-80 disabled:opacity-50"
      style={{
        fontFamily: "'Inter', sans-serif",
        borderColor: isPublished ? 'var(--border)' : 'var(--text)',
        backgroundColor: isPublished ? 'transparent' : 'var(--text)',
        color: isPublished ? 'var(--text-muted)' : 'var(--bg)',
      }}
      title={isPublished ? 'Unpublish work and all chapters' : 'Publish work and all chapters'}
    >
      {loading
        ? <Loader size={11} className="animate-spin" />
        : isPublished
          ? <><EyeOff size={11} /> Unpublish</>
          : <><Globe size={11} /> Publish all</>
      }
    </button>
  )
}
