import Link from 'next/link'
import Image from 'next/image'
import { BookOpen, FileText, Feather } from 'lucide-react'
import { Work } from '@/lib/types'
import { workTypeLabel, workBlurb } from '@/lib/utils'

interface WorkCardProps {
  work: Work
  variant?: 'grid' | 'featured'
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
  /* ─── Featured variant — editorial hero ─────────────────────────────── */
  if (variant === 'featured') {
    const desc = workBlurb(work.description, work.title)

    return (
      <Link href={workHref(work)} className="block group">
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
            className="text-base leading-relaxed line-clamp-2"
            style={{ fontFamily: "'Lora', serif", color: 'var(--text-muted)', fontStyle: 'italic' }}
          >
            {desc}
          </p>
        )}
      </Link>
    )
  }

  /* ─── Grid variant — bookshelf tile ─────────────────────────────────── */
  const Icon = typeIcon[work.type as keyof typeof typeIcon] ?? BookOpen
  const comicCover = work.type === 'comic' ? `/comics/${work.slug}/page-01.jpg` : null

  return (
    <Link href={workHref(work)} className="block group h-full">
      <div
        className="card-lift rounded-xl border overflow-hidden h-full flex flex-col"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        {/* Cover */}
        <div
          className="relative w-full aspect-[3/4] overflow-hidden"
          style={{ backgroundColor: 'var(--bg-subtle)' }}
        >
          {comicCover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={comicCover}
              alt={work.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : work.cover_image_url ? (
            <Image
              src={work.cover_image_url}
              alt={work.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3">
              <Icon size={26} strokeWidth={1.5} style={{ color: 'var(--text-faint)' }} />
              <span
                className="text-5xl leading-none opacity-15 select-none"
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
            className="uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)', fontSize: '0.6rem' }}
          >
            {workTypeLabel(work.type)}
          </span>
          <h3
            className="leading-snug"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400, fontSize: '1.05rem' }}
          >
            {work.title}
          </h3>
        </div>
      </div>
    </Link>
  )
}
