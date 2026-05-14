import { Navbar } from './Navbar'

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh flex flex-col" style={{ backgroundColor: 'var(--bg)' }}>
      <Navbar />
      <main className="flex-1 pt-14">
        {children}
      </main>
      <footer
        className="text-center py-8 text-xs border-t mt-16"
        style={{
          fontFamily: "'Inter', sans-serif",
          color: 'var(--text-faint)',
          borderColor: 'var(--border)',
        }}
      >
        © {new Date().getFullYear()} TJ Publishing House · All rights reserved
      </footer>
    </div>
  )
}
