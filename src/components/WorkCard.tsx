import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, FileText, Feather } from 'lucide-react'
import { Work } from '@/lib/types'
import { workTypeLabel, formatDate } from '@/lib/utils'

interface WorkCardProps {
  work: Work
  variant?: 'grid' | 'featured' | 'list' | 'comic'
}

const typeIcon = {
  novel: BookOpen,
  story: FileText,
  essay: Feather,
  comic: BookOpen,
} as const

function workHref(work: Work): string {
  return work.type === 'comic' ? `/comics/${work.slug}` : `/read/${work.slug}`
}

export function WorkCard({ work, variant = 'grid' }: WorkCardProps) {
  // Auto-promote comic works to comic variant
  if (work.type === 'comic' && variant !== 'comic') {
    variant = 'comic'
  }

  /* ─── Comic variant ──────────────────────────────────────────────── */
  if (variant === 'comic') {
    return (
      <Link href={workHref(work)} className="block group">
        <div
          className="card-lift rounded-xl border overflow-hidden h-full flex flex-col"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          {/* First-page thumbnail */}
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--bg-subtle)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/comics/${work.slug}/page-01.jpg`}
              alt={`${work.title} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>

          {/* Info */}
          <div className="p-4 flex flex-col gap-1.5">
            <p
              className="text-xs uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
            >
              Comic · {formatDate(work.created_at)}
            </p>
            <h3
              className="text-xl leading-snug"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
            >
              {work.title}
            </h3>
            {work.page_count && (
              <p
                className="text-xs"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                {work.page_count} pages
              </p>
            )}
          </div>
        </div>
      </Link>
    )
  }

  /* ─── Featured variant ───────────────────────────────────────────── */
  if (variant === 'featured') {
    return (
      <Link href={workHref(work)} className="block group">
        <div
          className="card-lift rounded-2xl overflow-hidden border flex flex-col sm:flex-row active:opacity-75"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          {/* Cover */}
          <div className="relative w-full sm:w-44 h-52 sm:h-auto shrink-0">
            {work.cover_image_url ? (
              <Image
                src={work.cover_image_url}
                alt={work.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div
                className="w-full h-full flex items-end p-5"
                style={{ backgroundColor: 'var(--bg-subtle)' }}
              >
                <span
                  className="text-6xl leading-none opacity-15"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
                >
                  {work.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 sm:p-7 flex flex-col justify-between gap-3">
            <div>
              <span
                className="text-xs uppercase tracking-widest mb-2.5 block"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                {workTypeLabel(work.type)} · Featured
              </span>
              <h2
                className="text-3xl sm:text-4xl mb-3 leading-tight"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
              >
                {work.title}
              </h2>
              {work.description && (
                <p
                  className="text-sm leading-relaxed line-clamp-3"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Lora', serif" }}
                >
                  {work.description}
                </p>
              )}
            </div>
            <span
              className="text-xs"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
            >
              {formatDate(work.created_at)}
            </span>
          </div>
        </div>
      </Link>
    )
  }

  /* ─── List variant (Figma-style) ─────────────────────────────────── */
  if (variant === 'list') {
    const Icon = typeIcon[work.type as keyof typeof typeIcon] ?? BookOpen
    return (
      <Link href={workHref(work)} className="block group">
        <div
          className="card-lift rounded-xl border p-5 h-full flex flex-col gap-3 active:opacity-60"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          {/* Type icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--border)' }}
          >
            <Icon size={16} style={{ color: 'var(--text-faint)' }} />
          </div>

          {/* Meta: type · date */}
          <p
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            {workTypeLabel(work.type)} · {formatDate(work.created_at)}
          </p>

          {/* Title */}
          <h3
            className="text-xl sm:text-2xl leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
          >
            {work.title}
          </h3>

          {/* Description */}
          {work.description && (
            <p
              className="text-sm leading-relaxed line-clamp-3 flex-1"
              style={{ fontFamily: "'Lora', serif", color: 'var(--text-muted)' }}
            >
              {work.description}
            </p>
          )}
        </div>
      </Link>
    )
  }

  /* ─── Grid variant (small card) ──────────────────────────────────── */
  return (
    <Link href={workHref(work)} className="block group active:opacity-70 transition-opacity">
      <div
        className="rounded-xl border overflow-hidden h-full flex flex-col"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        {/* Cover */}
        <div className="relative w-full aspect-[3/4]">
          {work.cover_image_url ? (
            <Image src={work.cover_image_url} alt={work.title} fill className="object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-end p-3"
              style={{ backgroundColor: 'var(--bg-subtle)' }}
            >
              <span
                className="text-5xl leading-none opacity-10"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
              >
                {work.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col gap-1 flex-1">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)', fontSize: '0.6rem' }}
          >
            {workTypeLabel(work.type)}
          </span>
          <h3
            className="text-base leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400, fontSize: '1.05rem' }}
          >
            {work.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
