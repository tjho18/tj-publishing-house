'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { toggleTheme } from '@/lib/theme'
import { Sun, Moon, Menu, X, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/novels', label: 'Novels' },
  { href: '/stories', label: 'Stories' },
  { href: '/essays', label: 'Essays' },
  { href: '/about', label: 'About' },
]

export function Navbar() {
  const pathname = usePathname()
  const [theme, setTheme] = useState<'day' | 'night'>('day')
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme') as 'day' | 'night'
    setTheme(t ?? 'day')
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false) }, [pathname])

  function handleToggle() {
    const next = toggleTheme()
    setTheme(next)
  }

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'shadow-sm' : ''
      )}
      style={{ backgroundColor: 'var(--nav-bg)', backdropFilter: 'blur(12px)' }}
    >
      <nav className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="font-display text-xl tracking-wide hover:opacity-80 transition-opacity"
          style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: 'var(--text)' }}
        >
          TJ Publishing House
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-6">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'text-sm transition-colors',
                pathname.startsWith(href)
                  ? 'font-medium'
                  : 'hover:opacity-80'
              )}
              style={{
                fontFamily: "'Inter', sans-serif",
                color: pathname.startsWith(href) ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {label}
            </Link>
          ))}

          <button
            onClick={handleToggle}
            aria-label="Toggle theme"
            className="ml-2 p-1.5 rounded-full transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'day' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          <Link
            href="/admin"
            aria-label="Admin panel"
            className="p-1.5 rounded-full transition-colors hover:opacity-80"
            style={{ color: 'var(--text-faint)' }}
            title="Admin"
          >
            <PenLine size={15} />
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex sm:hidden items-center gap-3">
          <Link
            href="/admin"
            aria-label="Admin panel"
            style={{ color: 'var(--text-faint)' }}
          >
            <PenLine size={15} />
          </Link>
          <button
            onClick={handleToggle}
            aria-label="Toggle theme"
            style={{ color: 'var(--text-muted)' }}
          >
            {theme === 'day' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
            style={{ color: 'var(--text-muted)' }}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="sm:hidden px-5 pb-5 pt-2 flex flex-col gap-4 border-t"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--nav-bg)' }}
        >
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-base py-1"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: pathname.startsWith(href) ? 'var(--accent)' : 'var(--text-muted)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
