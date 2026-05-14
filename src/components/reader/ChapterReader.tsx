'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Bookmark, Share2, ArrowLeft } from 'lucide-react'
import { Chapter, Work } from '@/lib/types'
import { generateHTML } from '@tiptap/html'
import StarterKit from '@tiptap/starter-kit'
import { Typography } from '@tiptap/extension-typography'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'

interface Props {
  work: Work
  chapter: Chapter
  prevChapter: Chapter | null
  nextChapter: Chapter | null
}

function getBookmarkKey(workSlug: string) {
  return `tj-bookmark-${workSlug}`
}

export function ChapterReader({ work, chapter, prevChapter, nextChapter }: Props) {
  const [bookmarked, setBookmarked] = useState(false)
  const [shared, setShared] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(getBookmarkKey(work.slug))
    if (saved) {
      const data = JSON.parse(saved)
      setBookmarked(data.chapterId === chapter.id)
    }
    // Auto-save progress
    localStorage.setItem(`tj-progress-${work.slug}`, JSON.stringify({
      chapterId: chapter.id,
      chapterSlug: chapter.slug,
    }))
  }, [work.slug, chapter.id, chapter.slug])

  function toggleBookmark() {
    const key = getBookmarkKey(work.slug)
    if (bookmarked) {
      localStorage.removeItem(key)
      setBookmarked(false)
    } else {
      localStorage.setItem(key, JSON.stringify({ chapterId: chapter.id, chapterSlug: chapter.slug }))
      setBookmarked(true)
    }
  }

  async function handleShare() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: `${work.title} — ${chapter.title}`, url })
    } else {
      await navigator.clipboard.writeText(url)
      setShared(true)
      setTimeout(() => setShared(false), 2000)
    }
  }

  // Render TipTap JSON to HTML
  let html = ''
  if (chapter.content) {
    try {
      html = generateHTML(chapter.content as Parameters<typeof generateHTML>[0], [
        StarterKit,
        Typography,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Underline,
      ])
    } catch {
      html = '<p>Content could not be rendered.</p>'
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Reading toolbar */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-12 flex items-center px-4 gap-3 border-b"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Back to work */}
        <Link
          href={work.type === 'novel' ? `/read/${work.slug}` : '/'}
          aria-label="Back"
          className="hover:opacity-70 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Title breadcrumb */}
        <div className="flex-1 min-w-0 text-center">
          <p
            className="text-xs truncate"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            {work.title}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            style={{ color: bookmarked ? 'var(--accent)' : 'var(--text-muted)' }}
            className="transition-colors"
          >
            <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share"
            style={{ color: 'var(--text-muted)' }}
            className="transition-colors hover:opacity-70"
          >
            <Share2 size={17} />
          </button>
        </div>
      </header>

      {shared && (
        <div
          className="fixed top-14 inset-x-0 z-40 text-center py-2 text-xs"
          style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--accent)',
          }}
        >
          Link copied to clipboard
        </div>
      )}

      {/* Chapter content */}
      <main className="flex-1 pt-16 pb-24">
        <article className="prose-reader mx-auto px-5 sm:px-8">
          {/* Chapter heading */}
          <header className="text-center mb-10 pt-4">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
            >
              {work.type === 'novel' ? `Chapter ${chapter.order_num}` : work.title}
            </p>
            <h1
              className="text-3xl sm:text-4xl"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
            >
              {chapter.title}
            </h1>
            <div
              className="mt-6 mx-auto w-12 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />
          </header>

          {/* Body */}
          <div
            dangerouslySetInnerHTML={{ __html: html || '<p style="color:var(--text-faint);text-align:center">This chapter has no content yet.</p>' }}
          />
        </article>
      </main>

      {/* Chapter navigation */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t flex"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {prevChapter ? (
          <Link
            href={`/read/${work.slug}/${prevChapter.slug}`}
            className="flex-1 flex items-center gap-2 px-5 py-4 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={16} />
            <span className="text-xs truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
              {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {/* Chapter indicator */}
        {work.type === 'novel' && (
          <Link
            href={`/read/${work.slug}`}
            className="flex items-center px-4 border-x text-xs hover:opacity-70 transition-opacity"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: 'var(--text-faint)',
              borderColor: 'var(--border)',
            }}
          >
            Ch. {chapter.order_num}
          </Link>
        )}

        {nextChapter ? (
          <Link
            href={`/read/${work.slug}/${nextChapter.slug}`}
            className="flex-1 flex items-center justify-end gap-2 px-5 py-4 hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="text-xs truncate" style={{ fontFamily: "'Inter', sans-serif" }}>
              {nextChapter.title}
            </span>
            <ChevronRight size={16} />
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-end px-5 py-4">
            <span
              className="text-xs italic"
              style={{ fontFamily: "'Lora', serif", color: 'var(--text-faint)' }}
            >
              {work.type === 'novel' ? 'End of available chapters' : 'Fin.'}
            </span>
          </div>
        )}
      </nav>
    </div>
  )
}
