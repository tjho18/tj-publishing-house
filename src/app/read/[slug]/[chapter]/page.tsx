import { createClient } from '@/lib/supabase/server'
import { Chapter, Work } from '@/lib/types'
import { notFound } from 'next/navigation'
import { ChapterReader } from '@/components/reader/ChapterReader'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string; chapter: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter: chapterSlug } = await params
  const supabase = await createClient()
  const { data: work } = await supabase.from('works').select('title').eq('slug', slug).single()
  const { data: chapter } = await supabase
    .from('chapters')
    .select('title')
    .eq('slug', chapterSlug)
    .single()
  if (!work || !chapter) return {}
  return { title: `${chapter.title} — ${work.title}` }
}

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter: chapterSlug } = await params
  const supabase = await createClient()

  // Fetch the work
  const { data: work } = await supabase
    .from('works')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!work) notFound()

  // Fetch all published chapters for this work (for nav)
  const { data: allChapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('work_id', work.id)
    .eq('status', 'published')
    .order('order_num', { ascending: true })

  const chapters = (allChapters ?? []) as Chapter[]
  const currentIndex = chapters.findIndex(c => c.slug === chapterSlug)
  if (currentIndex === -1) notFound()

  const chapter = chapters[currentIndex]
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null

  return (
    <ChapterReader
      work={work as Work}
      chapter={chapter}
      prevChapter={prevChapter}
      nextChapter={nextChapter}
    />
  )
}
