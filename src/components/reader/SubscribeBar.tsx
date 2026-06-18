'use client'

import { useState, useEffect } from 'react'
import { X, Mail } from 'lucide-react'

const STORAGE_KEY = 'tj-subscribe-dismissed'

interface Props {
  /** Extra bottom offset in px — use when a fixed nav bar is below */
  bottomOffset?: number
}

export function SubscribeBar({ bottomOffset = 0 }: Props) {
  const [visible, setVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [dismissed, setDismissed] = useState(true) // start hidden to avoid flash

  useEffect(() => {
    // Check if already dismissed / subscribed
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const { until } = JSON.parse(stored)
      if (Date.now() < until) return // still within dismiss window
    }
    setDismissed(false)

    // Show after 50% scroll OR 20 seconds, whichever comes first
    let shown = false
    function show() {
      if (!shown) { shown = true; setVisible(true) }
    }

    const timer = setTimeout(show, 20_000)
    function onScroll() {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)
      if (pct >= 0.5) show()
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [])

  function dismiss() {
    setVisible(false)
    setDismissed(true)
    // Don't show again for 30 days
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ until: Date.now() + 30 * 86_400_000 }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setState('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setState('success')
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ until: Date.now() + 365 * 86_400_000 }))
        setTimeout(() => setVisible(false), 3000)
      } else {
        setState('error')
      }
    } catch {
      setState('error')
    }
  }

  if (dismissed || !visible) return null

  return (
    <div
      className="fixed inset-x-0 z-40 px-4 transition-all duration-500"
      style={{ bottom: `${bottomOffset + 8}px` }}
    >
      <div
        className="max-w-lg mx-auto rounded-2xl border px-5 py-4 shadow-lg"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border)',
          backdropFilter: 'blur(16px)',
        }}
      >
        {state === 'success' ? (
          <p
            className="text-center text-sm py-1"
            style={{ fontFamily: "'Lora', serif", color: 'var(--text-muted)' }}
          >
            You're in. New work will find you. ✦
          </p>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Mail size={14} style={{ color: 'var(--text-faint)' }} />
                <p
                  className="text-sm"
                  style={{ fontFamily: "'Lora', serif", color: 'var(--text)' }}
                >
                  Get notified when TJ publishes something new.
                </p>
              </div>
              <button
                onClick={dismiss}
                className="shrink-0 hover:opacity-60 transition-opacity mt-0.5"
                style={{ color: 'var(--text-faint)' }}
                aria-label="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 rounded-full px-4 py-2 text-sm outline-none border"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: 'var(--bg)',
                  color: 'var(--text)',
                  borderColor: 'var(--border)',
                  fontSize: '0.8rem',
                }}
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="rounded-full px-4 py-2 text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-50 shrink-0"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  backgroundColor: 'var(--accent)',
                  color: 'var(--bg)',
                  fontSize: '0.8rem',
                }}
              >
                {state === 'loading' ? '…' : 'Subscribe'}
              </button>
            </form>
            {state === 'error' && (
              <p className="text-xs mt-2" style={{ color: '#ef4444', fontFamily: "'Inter', sans-serif" }}>
                Something went wrong. Try again.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  )
}
