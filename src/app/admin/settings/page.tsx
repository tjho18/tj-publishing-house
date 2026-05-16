import { createClient } from '@/lib/supabase/server'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { SettingsForm } from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('settings').select('key, value')
  const settings = Object.fromEntries((data ?? []).map(r => [r.key, r.value]))

  return (
    <AdminLayout>
      <div className="max-w-md">
        <h1
          className="text-3xl mb-8"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
        >
          Settings
        </h1>
        <SettingsForm initialPhotoUrl={settings.about_photo_url ?? ''} />
      </div>
    </AdminLayout>
  )
}
