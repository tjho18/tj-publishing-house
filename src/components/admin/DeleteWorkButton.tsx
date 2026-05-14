'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

export function DeleteWorkButton({ workId }: { workId: string }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('works').delete().eq('id', workId)
    router.push('/admin')
    router.refresh()
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="text-xs"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
        >
          Delete this work?
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs px-3 py-1.5 rounded-lg transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{ backgroundColor: '#ef4444', color: 'white', fontFamily: "'Inter', sans-serif" }}
        >
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-3 py-1.5 rounded-lg"
          style={{ color: 'var(--text-muted)', fontFamily: "'Inter', sans-serif" }}
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border hover:opacity-80 transition-opacity"
      style={{
        fontFamily: "'Inter', sans-serif",
        borderColor: 'var(--border)',
        color: 'var(--text-faint)',
      }}
    >
      <Trash2 size={12} />
      Delete
    </button>
  )
}
