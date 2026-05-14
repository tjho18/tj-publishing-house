import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ChapterEditor } from '@/components/admin/ChapterEditor'
import { Work, Chapter } from '@/lib/types'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string; chapterId: string }>
}

export default async function EditChapterPage({ params }: Props) {
  const { id, chapterId } = await params
  const supabase = await createClient()

  const [{ data: work }, { data: chapter }] = await Promise.all([
    supabase.from('works').select('*').eq('id', id).single(),
    supabase.from('chapters').select('*').eq('id', chapterId).single(),
  ])

  if (!work || !chapter) notFound()

  return (
    <AdminLayout>
      <ChapterEditor work={work as Work} chapter={chapter as Chapter} />
    </AdminLayout>
  )
}
