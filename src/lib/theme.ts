'use client'

import { getThemeFromHour } from './utils'

/**
 * Call once on the client to set the correct theme class on <html>.
 * Returns the resolved theme so callers can store it.
 */
export function applyTheme(): 'day' | 'night' {
  const hour = new Date().getHours()
  const theme = getThemeFromHour(hour)
  document.documentElement.setAttribute('data-theme', theme)
  return theme
}

/**
 * Allow reader to manually toggle and persist their preference for the session.
 */
export function toggleTheme(): 'day' | 'night' {
  const current = document.documentElement.getAttribute('data-theme')
  const next = current === 'day' ? 'night' : 'day'
  document.documentElement.setAttribute('data-theme', next)
  sessionStorage.setItem('tj-theme-override', next)
  return next
}

/**
 * Apply theme: honour session override first, then fall back to time-of-day.
 */
export function initTheme(): 'day' | 'night' {
  const override = sessionStorage.getItem('tj-theme-override') as 'day' | 'night' | null
  if (override === 'day' || override === 'night') {
    document.documentElement.setAttribute('data-theme', override)
    return override
  }
  return applyTheme()
}
