import { createClient } from '@/lib/supabase/server'
import { PublicLayout } from '@/components/PublicLayout'
import { WorkCard } from '@/components/WorkCard'
import { Work } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60

const VALID_FILTERS = ['novel', 'story', 'essay', 'comic'] as const
type TypeFilter = typeof VALID_FILTERS[number] | null

interface Props {
  searchParams: Promise<{ filter?: string }>
}

async function getData(typeFilter: TypeFilter) {
  const supabase = await createClient()

  if (typeFilter) {
    // Filtered view — no featured, just all works of that type
    const { data } = await supabase
      .from('works')
      .select('*')
      .eq('status', 'published')
      .eq('type', typeFilter)
      .order('created_at', { ascending: false })
      .limit(20)
    return { featured: null, works: (data ?? []) as Work[] }
  }

  // All works view — fetch featured + rest separately
  const [featuredRes, allRes] = await Promise.all([
    supabase
      .from('works')
      .select('*')
      .eq('status', 'published')
      .eq('featured', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single(),
    supabase
      .from('works')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const featured = featuredRes.data as Work | null
  const all = (allRes.data ?? []) as Work[]
  // Remove featured from the grid so it doesn't appear twice
  const works = all.filter(w => w.id !== featured?.id)

  return { featured, works }
}

const tabs = [
  { label: 'All Works', value: null },
  { label: 'Novels', value: 'novel' },
  { label: 'Short Stories', value: 'story' },
  { label: 'Essays', value: 'essay' },
  { label: 'Comics', value: 'comic' },
] as const

export default async function HomePage({ searchParams }: Props) {
  const { filter } = await searchParams
  const typeFilter: TypeFilter = VALID_FILTERS.includes(filter as typeof VALID_FILTERS[number])
    ? (filter as TypeFilter)
    : null

  const { featured, works } = await getData(typeFilter)

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-5 py-10">

        {/* Hero wordmark — mobile only */}
        <div className="text-center mb-10 sm:hidden">
          <h1
            className="text-5xl mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
          >
            TJ Publishing House
          </h1>
          <p
            className="text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            Novels · Stories · Essays · Comics
          </p>
        </div>

        {/* Featured work — only on "All Works" tab */}
        {!typeFilter && featured && (
          <section className="mb-10 pb-10 border-b" style={{ borderColor: 'var(--border)' }}>
            <WorkCard work={featured} variant="featured" />
          </section>
        )}

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {tabs.map(tab => {
            const isActive = typeFilter === tab.value
            return (
              <Link
                key={tab.label}
                href={tab.value ? `/?filter=${tab.value}` : '/'}
                className="px-4 py-1.5 rounded-full text-sm transition-opacity hover:opacity-80"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: isActive ? 'var(--text)' : 'transparent',
                  color: isActive ? 'var(--bg)' : 'var(--text-muted)',
                  border: `1px solid ${isActive ? 'transparent' : 'var(--border)'}`,
                }}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* Works list */}
        {works.length > 0 ? (
          typeFilter === 'comic' ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {works.map(work => (
                <WorkCard key={work.id} work={work} variant="comic" />
              ))}
            </div>
          ) : (
            <div className="border-t" style={{ borderColor: 'var(--border)' }}>
              {works.map(work => (
                <WorkCard key={work.id} work={work} variant="list" />
              ))}
            </div>
          )
        ) : (
          !featured && (
            <div className="text-center py-24">
              <p
                className="text-2xl mb-3"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-muted)' }}
              >
                {typeFilter ? 'Nothing here yet.' : 'Coming soon.'}
              </p>
              <p
                className="text-sm"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                {typeFilter ? 'Check back soon for new work.' : 'New works are on their way.'}
              </p>
            </div>
          )
        )}

      </div>
    </PublicLayout>
  )
}
