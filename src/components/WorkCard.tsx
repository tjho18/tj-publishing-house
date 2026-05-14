import Link from 'next/link'
import Image from 'next/image'
import { Work } from '@/lib/types'
import { workTypeLabel, formatDate } from '@/lib/utils'

interface WorkCardProps {
  work: Work
  variant?: 'grid' | 'featured'
}

export function WorkCard({ work, variant = 'grid' }: WorkCardProps) {
  if (variant === 'featured') {
    return (
      <Link href={`/read/${work.slug}`} className="block group">
        <div
          className="rounded-2xl overflow-hidden border flex flex-col sm:flex-row gap-0 transition-shadow hover:shadow-lg"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
        >
          {/* Cover */}
          <div className="relative w-full sm:w-52 h-56 sm:h-auto shrink-0">
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
                className="w-full h-full flex items-end p-4"
                style={{ backgroundColor: 'var(--accent-soft)' }}
              >
                <span
                  className="text-4xl font-display leading-none opacity-30"
                  style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--accent)' }}
                >
                  {work.title.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="p-6 flex flex-col justify-between gap-4">
            <div>
              <span
                className="text-xs uppercase tracking-widest font-medium mb-2 block"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--accent)' }}
              >
                {workTypeLabel(work.type)} · Featured
              </span>
              <h2
                className="text-3xl sm:text-4xl mb-3 group-hover:opacity-80 transition-opacity"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
              >
                {work.title}
              </h2>
              {work.description && (
                <p
                  className="text-sm leading-relaxed line-clamp-4"
                  style={{ color: 'var(--text-muted)', fontFamily: "'Lora', serif" }}
                >
                  {work.description}
                </p>
              )}
            </div>
            <div>
              <span
                className="text-xs"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                {formatDate(work.created_at)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/read/${work.slug}`} className="block group">
      <div
        className="rounded-xl border overflow-hidden transition-shadow hover:shadow-md h-full flex flex-col"
        style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}
      >
        {/* Cover */}
        <div className="relative w-full aspect-[2/3]">
          {work.cover_image_url ? (
            <Image src={work.cover_image_url} alt={work.title} fill className="object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-end p-4"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              <span
                className="text-6xl leading-none opacity-20"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--accent)' }}
              >
                {work.title.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 flex flex-col gap-1.5 flex-1">
          <span
            className="text-xs uppercase tracking-widest"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--accent)' }}
          >
            {workTypeLabel(work.type)}
          </span>
          <h3
            className="text-lg leading-snug group-hover:opacity-75 transition-opacity"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
          >
            {work.title}
          </h3>
          {work.description && (
            <p
              className="text-xs leading-relaxed line-clamp-2 mt-0.5"
              style={{ color: 'var(--text-muted)', fontFamily: "'Lora', serif" }}
            >
              {work.description}
            </p>
          )}
          <span
            className="text-xs mt-auto pt-2"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            {formatDate(work.created_at)}
          </span>
        </div>
      </div>
    </Link>
  )
}
