import { createClient } from '@/lib/supabase/server'
import { PublicLayout } from '@/components/PublicLayout'
import { WorkCard } from '@/components/WorkCard'
import { Work } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Novels' }
export const revalidate = 60

export default async function NovelsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('works')
    .select('*')
    .eq('status', 'published')
    .eq('type', 'novel')
    .order('created_at', { ascending: false })

  const works = (data ?? []) as Work[]

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-5 py-10">
        <h1
          className="text-4xl sm:text-5xl mb-2"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
        >
          Novels
        </h1>
        <p className="mb-10 text-sm" style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}>
          Long-form fiction
        </p>

        {works.length === 0 ? (
          <p className="text-center py-20" style={{ color: 'var(--text-muted)', fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem' }}>
            No novels published yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {works.map(work => <WorkCard key={work.id} work={work} />)}
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
