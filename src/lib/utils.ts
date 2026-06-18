import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function workTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    novel: 'Novel',
    story: 'Short Story',
    essay: 'Essay',
    comic: 'Comic',
  }
  return labels[type] ?? type
}

/**
 * Determine day or night theme based on the reader's local hour.
 * Day: 06:00 – 19:59
 * Night: 20:00 – 05:59
 */
export function getThemeFromHour(hour: number): 'day' | 'night' {
  return hour >= 6 && hour < 20 ? 'day' : 'night'
}
