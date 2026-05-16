import { createClient } from '@/lib/supabase/server'
import { PublicLayout } from '@/components/PublicLayout'
import { WorkCard } from '@/components/WorkCard'
import { Work } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 60

async function getData() {
  const supabase = await createClient()

  const [featuredRes, recentRes] = await Promise.all([
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
      .limit(9),
  ])

  return {
    featured: featuredRes.data as Work | null,
    recent: (recentRes.data ?? []) as Work[],
  }
}

export default async function HomePage() {
  const { featured, recent } = await getData()
  const recentFiltered = recent.filter(w => w.id !== featured?.id)

  return (
    <PublicLayout>
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Hero wordmark */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl sm:text-6xl mb-3"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
          >
            TJ Publishing House
          </h1>
          <p
            className="text-sm tracking-widest uppercase"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            Novels · Stories · Essays
          </p>
        </div>

        {/* Featured work */}
        {featured && (
          <section className="mb-14">
            <WorkCard work={featured} variant="featured" />
          </section>
        )}

        {/* Recent works grid */}
        {recentFiltered.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-2xl"
                style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
              >
                Recent Works
              </h2>
              <div className="flex gap-4">
                {(['novels', 'stories', 'essays'] as const).map(t => (
                  <Link
                    key={t}
                    href={`/${t}`}
                    className="text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
                    style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {recentFiltered.map(work => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {!featured && recentFiltered.length === 0 && (
          <div className="text-center py-24">
            <p
              className="text-2xl mb-3"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-muted)' }}
            >
              Coming soon.
            </p>
            <p
              className="text-sm"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
            >
              New works are on their way.
            </p>
          </div>
        )}
      </div>
    </PublicLayout>
  )
}
