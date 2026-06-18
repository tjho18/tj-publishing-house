import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ComicReader } from '@/components/reader/ComicReader'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from('works')
    .select('title, description')
    .eq('slug', slug)
    .eq('type', 'comic')
    .single()
  if (!data) return {}
  return { title: data.title, description: data.description ?? undefined }
}

export default async function ComicPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: work } = await supabase
    .from('works')
    .select('title, slug, page_count, type')
    .eq('slug', slug)
    .eq('status', 'published')
    .eq('type', 'comic')
    .single()

  if (!work) notFound()

  return (
    <ComicReader
      title={work.title}
      slug={work.slug}
      pageCount={work.page_count ?? 1}
    />
  )
}
