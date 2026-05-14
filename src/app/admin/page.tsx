import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { Work } from '@/lib/types'
import { workTypeLabel, formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Plus, Pencil, Eye, EyeOff } from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('works')
    .select('*')
    .order('updated_at', { ascending: false })

  const works = (data ?? []) as Work[]
  const published = works.filter(w => w.status === 'published').length
  const drafts = works.filter(w => w.status === 'draft').length

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-3xl mb-1"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
          >
            Your Works
          </h1>
          <p
            className="text-xs"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            {published} published · {drafts} draft{drafts !== 1 ? 's' : ''}
          </p>
        </div>

        <Link
          href="/admin/works/new"
          className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-85"
          style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          <Plus size={15} />
          New Work
        </Link>
      </div>

      {/* Type filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(['all', 'novel', 'story', 'essay'] as const).map(type => (
          <span
            key={type}
            className="text-xs px-3 py-1 rounded-full border capitalize"
            style={{
              fontFamily: "'Inter', sans-serif",
              borderColor: 'var(--border)',
              color: 'var(--text-muted)',
              backgroundColor: type === 'all' ? 'var(--accent-soft)' : 'transparent',
            }}
          >
            {type === 'all' ? `All (${works.length})` : `${type === 'story' ? 'Stories' : type.charAt(0).toUpperCase() + type.slice(1) + 's'} (${works.filter(w => w.type === type).length})`}
          </span>
        ))}
      </div>

      {/* Works list */}
      {works.length === 0 ? (
        <div
          className="text-center py-20 rounded-2xl border border-dashed"
          style={{ borderColor: 'var(--border)' }}
        >
          <p
            className="text-2xl mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text-muted)' }}
          >
            Nothing here yet.
          </p>
          <p
            className="text-sm mb-6"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            Create your first work to get started.
          </p>
          <Link
            href="/admin/works/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium hover:opacity-85 transition-opacity"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)', fontFamily: "'Inter', sans-serif" }}
          >
            <Plus size={14} />
            Create a work
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {works.map(work => (
            <div
              key={work.id}
              className="flex items-center gap-4 p-4 rounded-xl border hover:shadow-sm transition-shadow"
              style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
            >
              {/* Status dot */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{
                  backgroundColor: work.status === 'published' ? '#4ade80' : 'var(--text-faint)',
                }}
                title={work.status}
              />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-base truncate"
                    style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
                  >
                    {work.title}
                  </span>
                  {work.featured && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        backgroundColor: 'var(--accent-soft)',
                        color: 'var(--accent)',
                      }}
                    >
                      Featured
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span
                    className="text-xs"
                    style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
                  >
                    {workTypeLabel(work.type)}
                  </span>
                  <span
                    className="text-xs"
                    style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
                  >
                    Updated {formatDate(work.updated_at)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {work.status === 'published' && (
                  <Link
                    href={`/read/${work.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-md hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-muted)' }}
                    title="View"
                  >
                    <Eye size={15} />
                  </Link>
                )}
                <Link
                  href={`/admin/works/${work.id}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:opacity-85 transition-opacity"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    backgroundColor: 'var(--accent-soft)',
                    color: 'var(--accent)',
                  }}
                >
                  <Pencil size={12} />
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminLayout>
  )
}
