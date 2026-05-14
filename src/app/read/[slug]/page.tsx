import { createClient } from '@/lib/supabase/server'
import { PublicLayout } from '@/components/PublicLayout'
import { Work, Chapter } from '@/lib/types'
import { formatDate, workTypeLabel } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import { BookmarkButton } from '@/components/reader/BookmarkButton'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('works').select('title, description').eq('slug', slug).single()
  if (!data) return {}
  return { title: data.title, description: data.description ?? undefined }
}

export default async function WorkPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: work } = await supabase
    .from('works')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!work) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, title, slug, order_num, status, created_at')
    .eq('work_id', work.id)
    .eq('status', 'published')
    .order('order_num', { ascending: true })

  const publishedChapters = (chapters ?? []) as Chapter[]

  // For stories and essays with a single chapter → redirect straight to reading
  if ((work.type === 'story' || work.type === 'essay') && publishedChapters.length === 1) {
    const { redirect } = await import('next/navigation')
    redirect(`/read/${slug}/${publishedChapters[0].slug}`)
  }

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-5 py-10">
        {/* Back */}
        <Link
          href="/"
          className="text-xs uppercase tracking-widest mb-8 inline-block hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          ← Home
        </Link>

        {/* Cover + meta */}
        <div className="flex gap-6 mb-8">
          {work.cover_image_url ? (
            <div className="relative w-28 h-40 shrink-0 rounded-lg overflow-hidden">
              <Image src={work.cover_image_url} alt={work.title} fill className="object-cover" />
            </div>
          ) : (
            <div
              className="w-28 h-40 shrink-0 rounded-lg flex items-end p-3"
              style={{ backgroundColor: 'var(--accent-soft)' }}
            >
              <span
                className="text-5xl leading-none opacity-30"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--accent)' }}
              >
                {work.title.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex flex-col justify-between">
            <div>
              <span
                className="text-xs uppercase tracking-widest block mb-2"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--accent)' }}
              >
                {workTypeLabel(work.type)}
              </span>
              <h1
                className="text-3xl sm:text-4xl mb-2"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
              >
                {work.title}
              </h1>
              <p
                className="text-xs"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                {formatDate(work.created_at)}
              </p>
            </div>

            {publishedChapters.length > 0 && (
              <Link
                href={`/read/${slug}/${publishedChapters[0].slug}`}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-85"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg)',
                }}
              >
                <BookOpen size={14} />
                Start Reading
              </Link>
            )}
          </div>
        </div>

        {/* Description */}
        {work.description && (
          <p
            className="mb-10 leading-relaxed text-base"
            style={{ fontFamily: "'Lora', serif", color: 'var(--text-muted)' }}
          >
            {work.description}
          </p>
        )}

        {/* Divider */}
        <hr style={{ borderColor: 'var(--border)' }} className="mb-8" />

        {/* Chapter list (for novels) */}
        {work.type === 'novel' && (
          <section>
            <h2
              className="text-xl mb-5"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
            >
              Chapters
              <span
                className="text-sm ml-2 font-normal"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                ({publishedChapters.length})
              </span>
            </h2>

            {publishedChapters.length === 0 ? (
              <p style={{ color: 'var(--text-faint)', fontFamily: "'Inter', sans-serif", fontSize: '0.875rem' }}>
                No chapters published yet. Check back soon.
              </p>
            ) : (
              <ol className="space-y-0">
                {publishedChapters.map((chapter, i) => (
                  <li key={chapter.id}>
                    <Link
                      href={`/read/${slug}/${chapter.slug}`}
                      className="flex items-center gap-4 py-3.5 border-b group transition-opacity hover:opacity-80"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <span
                        className="text-sm w-7 shrink-0 text-right"
                        style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
                      >
                        {i + 1}
                      </span>
                      <div className="flex-1">
                        <span
                          className="text-base group-hover:underline underline-offset-2"
                          style={{ fontFamily: "'Lora', serif", color: 'var(--text)' }}
                        >
                          {chapter.title}
                        </span>
                      </div>
                      <BookmarkButton workSlug={slug} chapterSlug={chapter.slug} chapterId={chapter.id} />
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )}
      </div>
    </PublicLayout>
  )
}
