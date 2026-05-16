import { createClient } from '@/lib/supabase/server'
import { Chapter, Work } from '@/lib/types'
import { notFound } from 'next/navigation'
import { ChapterReader } from '@/components/reader/ChapterReader'
import { SubscribeBar } from '@/components/reader/SubscribeBar'
import { WorkCard } from '@/components/WorkCard'
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

  const { data: work } = await supabase
    .from('works')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!work) notFound()

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
  const isLastChapter = !nextChapter

  // Fetch suggested works only on the last chapter
  let suggestedWorks: Work[] = []
  if (isLastChapter) {
    const { data } = await supabase
      .from('works')
      .select('*')
      .eq('status', 'published')
      .neq('id', work.id)
      .order('created_at', { ascending: false })
      .limit(3)
    suggestedWorks = (data ?? []) as Work[]
  }

  return (
    <>
      <ChapterReader
        work={work as Work}
        chapter={chapter}
        prevChapter={prevChapter}
        nextChapter={nextChapter}
        suggestedWorks={suggestedWorks}
      />
      {/* Subscribe bar floats above the 56px chapter nav */}
      <SubscribeBar bottomOffset={56} />
    </>
  )
}
