import { createClient } from '@/lib/supabase/server'
import { PublicLayout } from '@/components/PublicLayout'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'About' }
export const revalidate = 60

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: photoSetting } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'about_photo_url')
    .single()

  const photoUrl = photoSetting?.value || null

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-5 py-12">

        {/* Photo */}
        {photoUrl && (
          <div className="mb-10 flex justify-center">
            <div className="relative w-36 h-36 rounded-full overflow-hidden border-2"
              style={{ borderColor: 'var(--border)' }}>
              <Image src={photoUrl} alt="TJ" fill className="object-cover" />
            </div>
          </div>
        )}

        {/* Name */}
        <h1
          className="text-4xl sm:text-5xl mb-2 text-center"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontWeight: 400 }}
        >
          TJ Ho
        </h1>
        <p
          className="text-center text-xs uppercase tracking-widest mb-12"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          Writer · Essayist · Creator
        </p>

        <hr style={{ borderColor: 'var(--border)', marginBottom: '3rem' }} />

        {/* Bio */}
        <div
          className="prose-reader mx-auto space-y-6"
          style={{ fontFamily: "'Lora', serif", fontSize: '1rem', lineHeight: '1.9', color: 'var(--text-muted)' }}
        >
          <p>
            TJ is a Canadian entrepreneur, novelist, essayist, and content creator currently based
            between China, the United States, and Latin America.
          </p>
          <p>
            His fiction ranges across genre and era — historical epics set during the Ming Dynasty
            voyages, horror rooted in the bureaucratic surreal, dark fantasy about revolution and
            its betrayals — unified by a preoccupation with cross-cultural encounter, systemic
            power, and the people history tends to forget.
          </p>
          <p>
            He has lived and worked in Canada, the United States, Turkey, China, and South America,
            experiences that inform both his writing and his work as an essayist and creator
            documenting life at the edges of the familiar.
          </p>
          <p>
            He publishes long-form essays on Substack and creates video and social content about
            travel and life.
          </p>
        </div>

        {/* Links */}
        <div className="flex items-center justify-center gap-x-6 gap-y-3 flex-wrap mt-12 pt-10 border-t"
          style={{ borderColor: 'var(--border)' }}>
          {[
            { label: 'Substack', href: 'https://substack.com/@tjho' },
            { label: 'Instagram', href: 'https://instagram.com/teajayho' },
            { label: 'YouTube', href: 'https://www.youtube.com/@tj_ho' },
            { label: 'LinkedIn', href: 'https://www.linkedin.com/in/tj-ho-9654701b9/' },
            { label: 'GitHub', href: 'https://github.com/tjho18' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm hover:opacity-60 transition-opacity"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
            >
              {label} ↗
            </a>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
