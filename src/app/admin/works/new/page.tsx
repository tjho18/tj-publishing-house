import { AdminLayout } from '@/components/admin/AdminLayout'
import { WorkForm } from '@/components/admin/WorkForm'

export default function NewWorkPage() {
  return (
    <AdminLayout>
      <div className="max-w-xl">
        <h1
          className="text-3xl mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
        >
          New Work
        </h1>
        <WorkForm />
      </div>
    </AdminLayout>
  )
}
