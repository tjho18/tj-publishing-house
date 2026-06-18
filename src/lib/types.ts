export type WorkType = 'novel' | 'story' | 'essay' | 'comic'
export type WorkStatus = 'draft' | 'published'
export type ChapterStatus = 'draft' | 'published'

export interface Work {
  id: string
  title: string
  slug: string
  type: WorkType
  description: string | null
  cover_image_url: string | null
  page_count: number | null
  status: WorkStatus
  featured: boolean
  created_at: string
  updated_at: string
  chapters?: Chapter[]
}

export interface Chapter {
  id: string
  work_id: string
  title: string
  slug: string
  order_num: number
  content: Record<string, unknown> | null
  status: ChapterStatus
  created_at: string
  updated_at: string
}

export type Theme = 'day' | 'night'
