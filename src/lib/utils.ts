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
 * Friendly chapter title. When a chapter's stored title is blank or just its
 * number (common with auto-split imports), render "Chapter N" instead of a
 * bare digit so lists and headers read naturally.
 */
export function chapterTitle(title: string | null, orderNum: number): string {
  const t = (title ?? '').trim()
  if (!t || /^\d+$/.test(t)) return `Chapter ${orderNum}`
  return t
}

/**
 * Return a clean blurb for a work, or null when the stored description is
 * unusable — i.e. it's just the title echoed back, or the full body text was
 * dumped into the description field (common with manually-created rows).
 */
export function workBlurb(
  description: string | null,
  title: string,
): string | null {
  if (!description) return null
  const desc = description.trim()
  if (!desc) return null

  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  // Description starts with the title → it's a text dump or echo, not a blurb.
  if (norm(desc).startsWith(norm(title))) return null
  // Overly long descriptions are almost certainly pasted body text.
  if (desc.length > 280) return null
  return desc
}

/**
 * Determine day or night theme based on the reader's local hour.
 * Day: 06:00 – 19:59
 * Night: 20:00 – 05:59
 */
export function getThemeFromHour(hour: number): 'day' | 'night' {
  return hour >= 6 && hour < 20 ? 'day' : 'night'
}
