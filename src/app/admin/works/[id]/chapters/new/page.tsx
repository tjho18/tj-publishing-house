import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { ChapterEditor } from '@/components/admin/ChapterEditor'
import { Work } from '@/lib/types'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function NewChapterPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: work } = await supabase.from('works').select('*').eq('id', id).single()
  if (!work) notFound()

  return (
    <AdminLayout>
      <ChapterEditor work={work as Work} />
    </AdminLayout>
  )
}
