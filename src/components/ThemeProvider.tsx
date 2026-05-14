'use client'

import { useEffect } from 'react'
import { initTheme } from '@/lib/theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initTheme()

    // Re-check every 10 minutes in case the hour crosses a threshold
    const id = setInterval(initTheme, 10 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  return <>{children}</>
}
