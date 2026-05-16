'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Bookmark, Share2, ArrowLeft, Clock } from 'lucide-react'
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

function estimateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ')
  const words = text.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 250))
}

export function ChapterReader({ work, chapter, prevChapter, nextChapter }: Props) {
  const router = useRouter()
  const [bookmarked, setBookmarked] = useState(false)
  const [shared, setShared] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [progress, setProgress] = useState(0)
  const lastScrollY = useRef(0)

  // Render TipTap JSON → HTML
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

  const readingTime = estimateReadingTime(html)

  // Restore bookmark state
  useEffect(() => {
    const saved = localStorage.getItem(getBookmarkKey(work.slug))
    if (saved) {
      const data = JSON.parse(saved)
      setBookmarked(data.chapterId === chapter.id)
    }
    // Auto-save reading progress
    localStorage.setItem(`tj-progress-${work.slug}`, JSON.stringify({
      chapterId: chapter.id,
      chapterSlug: chapter.slug,
    }))
  }, [work.slug, chapter.id, chapter.slug])

  // Scroll: progress bar + auto-hide header
  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0)

      const delta = scrollY - lastScrollY.current
      if (scrollY < 80) {
        setHeaderVisible(true)
      } else if (delta > 6) {
        setHeaderVisible(false) // scrolling down → hide
      } else if (delta < -6) {
        setHeaderVisible(true)  // scrolling up → show
      }
      lastScrollY.current = scrollY
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Keyboard shortcuts
  const toggleBookmark = useCallback(() => {
    const key = getBookmarkKey(work.slug)
    if (bookmarked) {
      localStorage.removeItem(key)
      setBookmarked(false)
    } else {
      localStorage.setItem(key, JSON.stringify({ chapterId: chapter.id, chapterSlug: chapter.slug }))
      setBookmarked(true)
    }
  }, [bookmarked, work.slug, chapter.id, chapter.slug])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowRight' && nextChapter) router.push(`/read/${work.slug}/${nextChapter.slug}`)
      if (e.key === 'ArrowLeft' && prevChapter) router.push(`/read/${work.slug}/${prevChapter.slug}`)
      if (e.key === 'b' || e.key === 'B') toggleBookmark()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nextChapter, prevChapter, work.slug, toggleBookmark, router])

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

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>

      {/* Reading progress bar */}
      <div
        className="reading-progress"
        style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
      />

      {/* Reading toolbar — auto-hides on scroll down */}
      <header
        className="fixed inset-x-0 z-50 h-12 flex items-center px-4 gap-3 border-b transition-transform duration-300"
        style={{
          top: 0,
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(14px)',
          transform: headerVisible ? 'translateY(0)' : 'translateY(-100%)',
        }}
      >
        {/* Back */}
        <Link
          href={work.type === 'novel' ? `/read/${work.slug}` : '/'}
          aria-label="Back"
          className="hover:opacity-60 transition-opacity p-1 -ml-1"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={18} />
        </Link>

        {/* Title */}
        <div className="flex-1 min-w-0 text-center">
          <p
            className="text-xs truncate"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            {work.title}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBookmark}
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark (B)'}
            className="p-2 transition-opacity hover:opacity-60"
            style={{ color: bookmarked ? 'var(--text)' : 'var(--text-muted)' }}
          >
            <Bookmark size={17} fill={bookmarked ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={handleShare}
            aria-label="Share"
            className="p-2 transition-opacity hover:opacity-60"
            style={{ color: 'var(--text-muted)' }}
          >
            <Share2 size={17} />
          </button>
        </div>
      </header>

      {/* Copied toast */}
      {shared && (
        <div
          className="fixed top-14 inset-x-0 z-40 text-center py-2 text-xs"
          style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: 'var(--accent-soft)',
            color: 'var(--text-muted)',
          }}
        >
          Link copied
        </div>
      )}

      {/* Chapter content */}
      <main className="flex-1 pt-14 pb-28">
        <article className="prose-reader mx-auto px-5 sm:px-8">

          {/* Chapter heading */}
          <header className="text-center mb-12 pt-8">
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
            >
              {work.type === 'novel' ? `Chapter ${chapter.order_num}` : work.title}
            </p>
            <h1
              className="text-3xl sm:text-4xl mb-4"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
            >
              {chapter.title}
            </h1>
            {/* Reading time */}
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <Clock size={11} style={{ color: 'var(--text-faint)' }} />
              <span
                className="text-xs"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                {readingTime} min read
              </span>
            </div>
            <div
              className="mx-auto w-8 h-px"
              style={{ backgroundColor: 'var(--border)' }}
            />
          </header>

          {/* Body */}
          <div
            dangerouslySetInnerHTML={{
              __html: html || '<p style="color:var(--text-faint);text-align:center;text-indent:0">This chapter has no content yet.</p>'
            }}
          />

          {/* Keyboard hint — desktop only, fades after mount */}
          <p
            className="hidden sm:block text-center mt-16 text-xs select-none"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)', letterSpacing: '0.04em' }}
          >
            ← → arrow keys to navigate · B to bookmark
          </p>
        </article>
      </main>

      {/* Chapter navigation — large touch targets */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 border-t flex"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(14px)',
          minHeight: '56px',
        }}
      >
        {prevChapter ? (
          <Link
            href={`/read/${work.slug}/${prevChapter.slug}`}
            className="flex-1 flex items-center gap-2 px-5 py-4 hover:opacity-60 transition-opacity active:opacity-40"
            style={{ color: 'var(--text-muted)' }}
          >
            <ChevronLeft size={16} className="shrink-0" />
            <span
              className="text-xs truncate"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {prevChapter.title}
            </span>
          </Link>
        ) : (
          <div className="flex-1" />
        )}

        {/* Chapter indicator / ToC link */}
        {work.type === 'novel' && (
          <Link
            href={`/read/${work.slug}`}
            className="flex items-center px-4 border-x text-xs hover:opacity-60 transition-opacity shrink-0"
            style={{
              fontFamily: "'Inter', sans-serif",
              color: 'var(--text-faint)',
              borderColor: 'var(--border)',
            }}
          >
            {chapter.order_num}
          </Link>
        )}

        {nextChapter ? (
          <Link
            href={`/read/${work.slug}/${nextChapter.slug}`}
            className="flex-1 flex items-center justify-end gap-2 px-5 py-4 hover:opacity-60 transition-opacity active:opacity-40"
            style={{ color: 'var(--text-muted)' }}
          >
            <span
              className="text-xs truncate"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {nextChapter.title}
            </span>
            <ChevronRight size={16} className="shrink-0" />
          </Link>
        ) : (
          <div className="flex-1 flex items-center justify-end px-5 py-4">
            <span
              className="text-xs italic"
              style={{ fontFamily: "'Lora', serif", color: 'var(--text-faint)' }}
            >
              {work.type === 'novel' ? 'End of chapter' : 'Fin.'}
            </span>
          </div>
        )}
      </nav>
    </div>
  )
}
