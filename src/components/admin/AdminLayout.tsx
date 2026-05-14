'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BookOpen, PenSquare, LogOut, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home, exact: true },
  { href: '/admin/works/new', label: 'New Work', icon: PenSquare, exact: false },
]

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      {/* Admin top bar */}
      <header
        className="sticky top-0 z-50 h-14 flex items-center px-5 justify-between border-b"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-5">
          <Link
            href="/admin"
            className="flex items-center gap-2"
          >
            <BookOpen size={18} style={{ color: 'var(--accent)' }} />
            <span
              className="font-medium text-sm"
              style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)', fontSize: '1.1rem' }}
            >
              TJ Admin
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-4">
            {navItems.map(({ href, label, icon: Icon, exact }) => {
              const active = exact ? pathname === href : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn('flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors')}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: active ? 'var(--accent)' : 'var(--text-muted)',
                    backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
          >
            View site ↗
          </Link>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 text-xs hover:opacity-70 transition-opacity"
            style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
          >
            <LogOut size={13} />
            Sign out
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 py-8">
        {children}
      </main>
    </div>
  )
}
