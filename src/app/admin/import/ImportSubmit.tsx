'use client'

import { useFormStatus } from 'react-dom'

export function ImportSubmit({ count }: { count: number }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-opacity hover:opacity-85 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: 'var(--text)', color: 'var(--bg)' }}
    >
      {pending ? 'Importing…' : `Import ${count} works →`}
    </button>
  )
}
