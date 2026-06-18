'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  title: string
  slug: string
  pageCount: number
}

export function ComicReader({ title, slug, pageCount }: Props) {
  const [page, setPage] = useState(1)
  const [imgLoaded, setImgLoaded] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const storageKey = `tj-comic-${slug}`

  // Restore saved reading position
  useEffect(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const n = parseInt(saved, 10)
      if (n >= 1 && n <= pageCount) setPage(n)
    }
  }, [slug, pageCount, storageKey])

  // Persist reading position
  useEffect(() => {
    localStorage.setItem(storageKey, String(page))
  }, [page, storageKey])

  const prev = useCallback(() => setPage(p => Math.max(1, p - 1)), [])
  const next = useCallback(() => setPage(p => Math.min(pageCount, p + 1)), [pageCount])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev, next])

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 48) {
      delta > 0 ? prev() : next()
    }
    touchStartX.current = null
  }

  const pageNum = String(page).padStart(2, '0')
  const imgSrc = `/comics/${slug}/page-${pageNum}.jpg`
  const progress = ((page - 1) / Math.max(pageCount - 1, 1)) * 100

  return (
    <div
      className="min-h-dvh flex flex-col select-none"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Top bar */}
      <header
        className="fixed inset-x-0 top-0 z-50 h-12 flex items-center px-4 border-b"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <Link
          href="/"
          className="p-1.5 -ml-1.5 transition-opacity hover:opacity-60"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Back to home"
        >
          <ArrowLeft size={18} />
        </Link>

        <p
          className="flex-1 text-center text-sm truncate px-4"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
        >
          {title}
        </p>

        <span
          className="text-xs tabular-nums shrink-0"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          {page} / {pageCount}
        </span>
      </header>

      {/* Comic page */}
      <main
        className="relative flex-1 flex items-center justify-center pt-12 pb-16 px-2"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Tap zones for mobile */}
        <button
          onClick={prev}
          className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-w-resize opacity-0"
          aria-label="Previous page"
          disabled={page === 1}
        />
        <button
          onClick={next}
          className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-e-resize opacity-0"
          aria-label="Next page"
          disabled={page === pageCount}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={imgSrc}
          src={imgSrc}
          alt={`${title}, page ${page} of ${pageCount}`}
          className="max-h-[calc(100dvh-7rem)] w-auto max-w-full object-contain rounded-sm shadow-sm"
          style={{
            opacity: imgLoaded ? 1 : 0,
            transition: 'opacity 0.18s ease',
          }}
          onLoadStart={() => setImgLoaded(false)}
          onLoad={() => setImgLoaded(true)}
        />
      </main>

      {/* Bottom bar */}
      <nav
        className="fixed bottom-0 inset-x-0 z-50 h-14 flex items-center px-4 gap-3 border-t"
        style={{
          backgroundColor: 'var(--nav-bg)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(14px)',
        }}
      >
        <button
          onClick={prev}
          disabled={page === 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-25 hover:opacity-70"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
        >
          <ChevronLeft size={16} />
          Prev
        </button>

        {/* Progress bar */}
        <div
          className="flex-1 h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--border)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, backgroundColor: 'var(--text-muted)' }}
          />
        </div>

        <button
          onClick={next}
          disabled={page === pageCount}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-opacity disabled:opacity-25 hover:opacity-70"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
        >
          Next
          <ChevronRight size={16} />
        </button>
      </nav>
    </div>
  )
}
