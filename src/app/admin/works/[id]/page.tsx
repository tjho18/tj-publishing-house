import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { WorkForm } from '@/components/admin/WorkForm'
import { Work, Chapter } from '@/lib/types'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import { DeleteWorkButton } from '@/components/admin/DeleteWorkButton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function WorkEditPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: work } = await supabase.from('works').select('*').eq('id', id).single()
  if (!work) notFound()

  const { data: chapters } = await supabase
    .from('chapters')
    .select('*')
    .eq('work_id', id)
    .order('order_num', { ascending: true })

  const chapterList = (chapters ?? []) as Chapter[]

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin"
            className="text-xs uppercase tracking-widest hover:opacity-70 transition-opacity block mb-2"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            ← Works
          </Link>
          <h1
            className="text-3xl"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
          >
            {work.title}
          </h1>
        </div>
        <DeleteWorkButton workId={work.id} />
      </div>

      <div className="grid sm:grid-cols-2 gap-10">
        {/* Work details form */}
        <section>
          <h2
            className="text-lg mb-5"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
          >
            Details
          </h2>
          <WorkForm work={work as Work} />
        </section>

        {/* Chapters */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2
              className="text-lg"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
            >
              {work.type === 'novel' ? 'Chapters' : 'Content'}
            </h2>
            <Link
              href={`/admin/works/${id}/chapters/new`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium hover:opacity-85 transition-opacity"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: 'var(--accent)',
                color: 'var(--bg)',
              }}
            >
              <Plus size={12} />
              {work.type === 'novel' ? 'Add chapter' : 'Add content'}
            </Link>
          </div>

          {chapterList.length === 0 ? (
            <div
              className="text-center py-12 rounded-xl border border-dashed"
              style={{ borderColor: 'var(--border)' }}
            >
              <p
                className="text-sm mb-3"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
              >
                No {work.type === 'novel' ? 'chapters' : 'content'} yet.
              </p>
              <Link
                href={`/admin/works/${id}/chapters/new`}
                className="text-xs hover:opacity-70 transition-opacity"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--accent)' }}
              >
                + Add one now
              </Link>
            </div>
          ) : (
            <ol className="space-y-1.5">
              {chapterList.map((ch, i) => (
                <li
                  key={ch.id}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                >
                  {work.type === 'novel' && (
                    <span
                      className="text-xs w-5 text-right shrink-0"
                      style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
                    >
                      {i + 1}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className="text-sm truncate block"
                      style={{ fontFamily: "'Lora', serif", color: 'var(--text)' }}
                    >
                      {ch.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className="text-xs"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: ch.status === 'published' ? '#4ade80' : 'var(--text-faint)',
                      }}
                    >
                      {ch.status}
                    </span>
                    <Link
                      href={`/admin/works/${id}/chapters/${ch.id}`}
                      className="p-1 rounded hover:opacity-70 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Pencil size={13} />
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </AdminLayout>
  )
}
