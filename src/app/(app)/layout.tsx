import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AppSidebar } from '@/components/AppSidebar'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const cookieStore = await cookies()
  const theme = cookieStore.get('ai-theme')?.value ?? 'light'

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      name: true, email: true, cefrLevel: true, sector: true,
      xp: true, level: true, streakDays: true,
      srsItems: { where: { due: { lte: new Date() } }, select: { id: true } },
    },
  })
  if (!user) redirect('/login')

  const pendingReviews = user.srsItems.length
  const userName = user.name ?? user.email.split('@')[0]

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)' }}>
      <AppSidebar
        userName={userName}
        userLevel={user.cefrLevel ?? 'A1'}
        sector={user.sector ?? 'tech'}
        xp={user.xp}
        pendingReviews={pendingReviews}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <header style={{
          height: 64, flexShrink: 0,
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '0 32px',
          borderBottom: '1px solid var(--card-ring)',
          background: 'var(--bg)',
          position: 'relative', zIndex: 2,
        }}>
          <div style={{ flex: 1 }} />

          {/* XP chip */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: 'color-mix(in oklab, var(--accent) 18%, transparent)',
            border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)',
            borderRadius: 999,
            color: 'var(--accent-2)', fontWeight: 800, fontSize: 14,
            fontFamily: 'var(--f-sans)',
          }}>
            <BoltIcon />
            <span style={{ color: 'var(--ink)' }}>{user.xp.toLocaleString()}</span>
          </div>

          {/* Streak */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 12px 6px 10px',
            background: 'color-mix(in oklab, var(--coral) 16%, transparent)',
            border: '1px solid color-mix(in oklab, var(--coral) 25%, transparent)',
            borderRadius: 999,
            color: 'var(--coral)', fontWeight: 700, fontSize: 14,
            fontFamily: 'var(--f-sans)',
          }}>
            <FlameIcon />
            <span style={{ color: 'var(--ink)' }}>{user.streakDays}</span>
          </div>

          <ThemeToggle theme={theme} />
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflow: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}

function BoltIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>
}
function FlameIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14c0-3 3.5-4 3.5-9 3 2 7 5 7 10a7 7 0 0 1-14 0c0-2 1-3.5 2-4.5 0 1.5.7 2.5 1.5 3.5z"/></svg>
}
