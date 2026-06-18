import Link from 'next/link'
import { Navbar } from './Navbar'
import { SubscribeBar } from './reader/SubscribeBar'

const footerLinks = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Substack', href: 'https://substack.com/@tjho', external: true },
  { label: 'Instagram', href: 'https://instagram.com/teajayho', external: true },
]

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main className="flex-1 pt-14">
        {children}
      </main>
      <footer
        className="border-t mt-16"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="max-w-3xl mx-auto px-5 py-10 flex flex-col items-center gap-5 text-center">
          <Link
            href="/"
            className="text-lg tracking-wide hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--text)' }}
          >
            TJ Publishing House
          </Link>

          <nav className="flex items-center gap-x-6 gap-y-2 flex-wrap justify-center">
            {footerLinks.map(({ label, href, external }) => (
              <Link
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="text-sm hover:opacity-70 transition-opacity"
                style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <p
            className="text-xs"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            © {new Date().getFullYear()} TJ Publishing House · Read freely.
          </p>
        </div>
      </footer>
      <SubscribeBar />
    </div>
  )
}
