'use client'

import { useState, useEffect } from 'react'
import { Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  workSlug: string
  chapterSlug: string
  chapterId: string
}

function getBookmarkKey(workSlug: string) {
  return `tj-bookmark-${workSlug}`
}

export function BookmarkButton({ workSlug, chapterSlug, chapterId }: Props) {
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(getBookmarkKey(workSlug))
    if (saved) {
      const data = JSON.parse(saved)
      setBookmarked(data.chapterId === chapterId)
    }
  }, [workSlug, chapterId])

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const key = getBookmarkKey(workSlug)
    if (bookmarked) {
      localStorage.removeItem(key)
      setBookmarked(false)
    } else {
      localStorage.setItem(key, JSON.stringify({ chapterId, chapterSlug }))
      setBookmarked(true)
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark this chapter'}
      className={cn('p-1 transition-colors shrink-0')}
      style={{ color: bookmarked ? 'var(--accent)' : 'var(--text-faint)' }}
    >
      <Bookmark size={15} fill={bookmarked ? 'currentColor' : 'none'} />
    </button>
  )
}

// Utility for reading pages to pick up the bookmark
export function getBookmark(workSlug: string): { chapterId: string; chapterSlug: string } | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem(getBookmarkKey(workSlug))
  return saved ? JSON.parse(saved) : null
}
