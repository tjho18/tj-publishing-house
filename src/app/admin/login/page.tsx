'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center px-5"
      style={{ backgroundColor: 'var(--bg)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border p-8"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <h1
          className="text-3xl mb-1 text-center"
          style={{ fontFamily: "'Cormorant Garamond', serif", color: 'var(--text)' }}
        >
          TJ Publishing House
        </h1>
        <p
          className="text-xs text-center mb-8"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          Admin access
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              className="block text-xs mb-1.5 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border focus:ring-1"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            />
          </div>

          <div>
            <label
              className="block text-xs mb-1.5 uppercase tracking-widest"
              style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-muted)' }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none border focus:ring-1"
              style={{
                fontFamily: "'Inter', sans-serif",
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            />
          </div>

          {error && (
            <p className="text-xs text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-sm font-medium transition-opacity hover:opacity-85 disabled:opacity-50 mt-2"
            style={{
              fontFamily: "'Inter', sans-serif",
              backgroundColor: 'var(--accent)',
              color: 'var(--bg)',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
