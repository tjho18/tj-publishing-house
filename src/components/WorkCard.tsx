import Link from 'next/link'
import Image from 'next/image'
import { Work } from '@/lib/types'
import { workTypeLabel, formatDate } from '@/lib/utils'

interface WorkCardProps {
  work: Work
  variant?: 'grid' | 'featured' | 'list' | 'comic'
}

function workHref(work: Work): string {
  return work.type === 'comic' ? `/comics/${work.slug}` : `/read/${work.slug}`
}

export function WorkCard({ work, variant = 'grid' }: WorkCardProps) {
  if (work.type === 'comic' && variant !== 'comic') {
    variant = 'comic'
  }

  /* ─── Comic variant ─────────────────────────────────────────────────── */
  if (variant === 'comic') {
    return (
      <Link href={workHref(work)} className="block group">
        <div
          className="card-lift rounded-xl border overflow-hidden h-full flex flex-col"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-[var(--bg-subtle)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/comics/${work.slug}/page-01.jpg`}
              alt={`${work.title} cover`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
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

  /* ─── Featured variant — editorial hero ─────────────────────────────── */
  if (variant === 'featured') {
    // Skip descriptions that are just the title echoed back (stale DB data)
    const desc = work.description && !work.description.startsWith(work.title)
      ? work.description
      : null

    return (
      <Link href={workHref(work)} className="block group">
        {/* Hero image */}
        {work.cover_image_url ? (
          <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden mb-6">
            <Image
              src={work.cover_image_url}
              alt={work.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              priority
            />
          </div>
        ) : (
          <div
            className="w-full h-28 sm:h-36 rounded-xl mb-6 flex items-end px-6 pb-5"
            style={{ backgroundColor: 'var(--bg-subtle)' }}
          >
            <span
              className="text-8xl leading-none opacity-10 select-none"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
            >
              {work.title.charAt(0)}
            </span>
          </div>
        )}

        <p
          className="text-xs uppercase tracking-widest mb-3"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          {workTypeLabel(work.type)} · Featured
        </p>

        <h2
          className="text-3xl sm:text-4xl mb-3 leading-tight group-hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
        >
          {work.title}
        </h2>

        {desc && (
          <p
            className="text-base leading-relaxed mb-4 line-clamp-2"
            style={{ fontFamily: "'Lora', serif", color: 'var(--text-muted)', fontStyle: 'italic' }}
          >
            {desc}
          </p>
        )}

        <p
          className="text-xs"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          {formatDate(work.created_at)}
        </p>
      </Link>
    )
  }

  /* ─── List variant — Medium-style horizontal ─────────────────────────── */
  if (variant === 'list') {
    const desc = work.description && !work.description.startsWith(work.title)
      ? work.description
      : null

    return (
      <Link
        href={workHref(work)}
        className="block group py-6 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-start gap-5 sm:gap-8">
          <div className="flex-1 min-w-0">
            <p
              className="text-xs uppercase tracking-widest mb-2"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
            >
              {workTypeLabel(work.type)} · {formatDate(work.created_at)}
            </p>
            <h3
              className="text-xl sm:text-2xl leading-snug mb-2 group-hover:opacity-70 transition-opacity"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 500 }}
            >
              {work.title}
            </h3>
            {desc && (
              <p
                className="text-sm leading-relaxed line-clamp-2"
                style={{ fontFamily: "'Lora', serif", color: 'var(--text-muted)', fontStyle: 'italic' }}
              >
                {desc}
              </p>
            )}
          </div>

          {work.cover_image_url && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden">
              <Image src={work.cover_image_url} alt={work.title} fill className="object-cover" />
            </div>
          )}
        </div>
      </Link>
    )
  }

  /* ─── Grid variant ───────────────────────────────────────────────────── */
  return (
    <Link href={workHref(work)} className="block group active:opacity-70 transition-opacity">
      <div
        className="card-lift rounded-xl border overflow-hidden h-full flex flex-col"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
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
