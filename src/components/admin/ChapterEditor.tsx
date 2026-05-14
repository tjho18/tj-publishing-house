'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Typography } from '@tiptap/extension-typography'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { createClient } from '@/lib/supabase/client'
import { Chapter, Work, ChapterStatus } from '@/lib/types'
import { slugify } from '@/lib/utils'
import {
  Bold, Italic, UnderlineIcon, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, AlignLeft,
  AlignCenter, AlignRight, Save, Trash2, Globe, EyeOff
} from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Props {
  work: Work
  chapter?: Chapter
}

const AUTOSAVE_DELAY = 3000

export function ChapterEditor({ work, chapter }: Props) {
  const router = useRouter()
  const [title, setTitle] = useState(chapter?.title ?? '')
  const [status, setStatus] = useState<ChapterStatus>(chapter?.status ?? 'draft')
  const [saving, setSaving] = useState(false)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isNew = !chapter

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Begin writing…' }),
      Typography,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: chapter?.content ?? '',
    editorProps: {
      attributes: { class: 'tiptap-editor' },
    },
    onUpdate: () => {
      if (!isNew) scheduleAutosave()
    },
  })

  function scheduleAutosave() {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current)
    autosaveTimer.current = setTimeout(() => saveChapter(false), AUTOSAVE_DELAY)
  }

  useEffect(() => {
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current) }
  }, [])

  // Cmd/Ctrl+S shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        saveChapter(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const saveChapter = useCallback(async (redirect = false) => {
    if (!editor) return
    setSaving(true)
    setSaveState('saving')
    setError('')
    const supabase = createClient()
    const content = editor.getJSON()

    if (isNew) {
      const slug = slugify(title || 'untitled')
      const orderNum = 1 // server will compute max+1 if needed
      const { data: existing } = await supabase
        .from('chapters')
        .select('order_num')
        .eq('work_id', work.id)
        .order('order_num', { ascending: false })
        .limit(1)
        .single()

      const nextOrder = existing ? (existing.order_num as number) + 1 : 1

      const { data, error } = await supabase
        .from('chapters')
        .insert({
          work_id: work.id,
          title: title || 'Untitled',
          slug,
          order_num: nextOrder,
          content,
          status,
        })
        .select('id')
        .single()

      if (error) { setError(error.message); setSaveState('error'); setSaving(false); return }
      setSaveState('saved')
      setSaving(false)
      router.push(`/admin/works/${work.id}/chapters/${data.id}`)
    } else {
      const { error } = await supabase
        .from('chapters')
        .update({ title, content, status })
        .eq('id', chapter!.id)

      if (error) { setError(error.message); setSaveState('error'); setSaving(false); return }
      setSaveState('saved')
      setSaving(false)
      setTimeout(() => setSaveState('idle'), 2000)
      if (redirect) router.push(`/admin/works/${work.id}`)
    }
  }, [editor, title, status, isNew, chapter, work.id, router])

  async function deleteChapter() {
    if (!chapter) return
    if (!confirm('Delete this chapter permanently?')) return
    const supabase = createClient()
    await supabase.from('chapters').delete().eq('id', chapter.id)
    router.push(`/admin/works/${work.id}`)
    router.refresh()
  }

  const ToolBtn = ({
    onClick, active, title: t, children
  }: {
    onClick: () => void; active?: boolean; title?: string; children: React.ReactNode
  }) => (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      title={t}
      className={cn(
        'p-1.5 rounded transition-colors',
        active ? 'opacity-100' : 'opacity-50 hover:opacity-80'
      )}
      style={{
        backgroundColor: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--accent)' : 'var(--text)',
      }}
    >
      {children}
    </button>
  )

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div
        className="sticky top-14 z-40 flex items-center gap-3 px-4 py-2 border-b flex-wrap"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <Link
          href={`/admin/works/${work.id}`}
          className="text-xs hover:opacity-70 transition-opacity shrink-0"
          style={{ fontFamily: "'Inter', sans-serif", color: 'var(--text-faint)' }}
        >
          ← {work.title}
        </Link>

        <div className="flex-1" />

        {/* Save status */}
        <span
          className="text-xs shrink-0"
          style={{
            fontFamily: "'Inter', sans-serif",
            color: saveState === 'saved' ? '#4ade80'
              : saveState === 'error' ? '#ef4444'
              : saveState === 'saving' ? 'var(--text-faint)'
              : 'var(--text-faint)',
          }}
        >
          {saveState === 'saving' ? 'Saving…'
            : saveState === 'saved' ? 'Saved'
            : saveState === 'error' ? 'Error saving'
            : ''}
        </span>

        {/* Status toggle */}
        <button
          type="button"
          onClick={() => setStatus(s => s === 'published' ? 'draft' : 'published')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
          style={{
            fontFamily: "'Inter', sans-serif",
            borderColor: status === 'published' ? '#4ade80' : 'var(--border)',
            color: status === 'published' ? '#4ade80' : 'var(--text-muted)',
            backgroundColor: 'transparent',
          }}
        >
          {status === 'published' ? <Globe size={11} /> : <EyeOff size={11} />}
          {status === 'published' ? 'Published' : 'Draft'}
        </button>

        <button
          type="button"
          onClick={() => saveChapter(false)}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity hover:opacity-85 disabled:opacity-50"
          style={{
            fontFamily: "'Inter', sans-serif",
            backgroundColor: 'var(--accent)',
            color: 'var(--bg)',
          }}
        >
          <Save size={11} />
          Save
        </button>

        {!isNew && (
          <button
            type="button"
            onClick={deleteChapter}
            className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
            style={{ color: 'var(--text-faint)' }}
            title="Delete chapter"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      {/* Title */}
      <div className="max-w-2xl mx-auto w-full px-5 pt-8 pb-2">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder={work.type === 'novel' ? 'Chapter title…' : 'Title…'}
          className="w-full text-3xl outline-none bg-transparent border-none"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            color: 'var(--text)',
            caretColor: 'var(--accent)',
          }}
        />
        <div
          className="mt-2 h-px w-16"
          style={{ backgroundColor: 'var(--border)' }}
        />
      </div>

      {/* Formatting toolbar */}
      {editor && (
        <div
          className="sticky top-[6.5rem] z-30 flex items-center gap-0.5 px-5 py-1 border-b overflow-x-auto"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
        >
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
            <Bold size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
            <Italic size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
            <UnderlineIcon size={14} />
          </ToolBtn>

          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border)' }} />

          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
            <Heading2 size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
            <Heading3 size={14} />
          </ToolBtn>

          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border)' }} />

          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
            <List size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
            <ListOrdered size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
            <Quote size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Divider">
            <Minus size={14} />
          </ToolBtn>

          <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border)' }} />

          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
            <AlignLeft size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
            <AlignCenter size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
            <AlignRight size={14} />
          </ToolBtn>
        </div>
      )}

      {/* Editor body */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-5 py-4">
        <div className="tiptap-editor">
          <EditorContent editor={editor} />
        </div>
        {error && (
          <p className="text-xs mt-4 text-red-500" style={{ fontFamily: "'Inter', sans-serif" }}>{error}</p>
        )}
      </div>
    </div>
  )
}
