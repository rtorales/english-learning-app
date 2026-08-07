'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/actions/auth'

const NAV = [
  { href: '/dashboard',  label: 'Inicio',        icon: HomeIcon },
  { href: '/map',        label: 'Mi camino',      icon: MapIcon },
  { href: '/review',     label: 'Repaso',         icon: CardsIcon, badge: true },
  { href: '/vocabulary', label: 'Vocabulario',    icon: BookIcon },
  { href: '/analytics',  label: 'Mi análisis',    icon: ChartIcon },
  { href: '/placement',  label: 'Test CEFR',      icon: TargetIcon },
  { href: '/profile',    label: 'Mi perfil',      icon: UserIcon },
]

interface AppSidebarProps {
  userName: string
  userLevel: string
  sector: string
  xp: number
  pendingReviews: number
}

export function AppSidebar({ userName, userLevel, sector, xp, pendingReviews }: AppSidebarProps) {
  const pathname = usePathname()
  const dailyGoal = 50
  const todayXP = Math.min(xp % dailyGoal, dailyGoal)
  const initials = userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: 'var(--card)',
      borderRight: '1px solid var(--card-ring)',
      display: 'flex', flexDirection: 'column',
      padding: '22px 14px 18px',
      height: '100vh',
      position: 'sticky', top: 0,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 8px 20px' }}>
        <Logo />
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.label} href={item.href} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12,
                background: isActive ? 'var(--primary-tint)' : 'transparent',
                color: isActive ? 'var(--primary-2)' : 'var(--ink-2)',
                fontFamily: 'var(--f-sans)', fontWeight: isActive ? 700 : 600,
                fontSize: 14, transition: 'background 140ms, color 140ms',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'var(--bg-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-2)'; } }}
              >
                <item.icon active={isActive} />
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && pendingReviews > 0 && (
                  <span style={{
                    background: 'var(--coral)', color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 999,
                  }}>{pendingReviews}</span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Daily goal */}
      <div style={{ marginTop: 'auto' }}>
        <div style={{
          background: 'linear-gradient(180deg, var(--primary-tint), var(--bg-soft))',
          border: '1px solid var(--card-ring)',
          borderRadius: 14, padding: 14,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TargetIcon active size={15} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Meta de hoy</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--f-sans)', letterSpacing: '-0.02em' }}>{todayXP}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>/ {dailyGoal} XP</span>
          </div>
          <ProgressBar value={todayXP} max={dailyGoal} height={8} />
        </div>

        {/* User row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '6px 8px' }}>
          <Avatar initials={initials} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sector} · Nivel {userLevel}</div>
          </div>
          <form action={logoutAction}>
            <button title="Salir" style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <LogoutIcon />
            </button>
          </form>
        </div>
      </div>
    </aside>
  )
}

/* ---- Mini components ---- */
function Logo() {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: 33, height: 33, borderRadius: 10,
        background: 'var(--primary)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: 'inset 0 -3px 0 rgba(0,0,0,0.12)',
        flexShrink: 0,
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M5 4c4 0 7 2 7 6 0-4 3-6 7-6v12c-4 0-7 2-7 6 0-4-3-6-7-6z" fill="#fff"/>
          <path d="M12 10v10" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
        </svg>
      </div>
      <span style={{ fontFamily: 'var(--f-sans)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
        aprende<span style={{ color: 'var(--primary)' }}>inglés</span>
      </span>
    </div>
  )
}

function ProgressBar({ value, max, height = 10 }: { value: number; max: number; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ height, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden', position: 'relative', boxShadow: 'inset 0 1px 2px rgba(58,47,74,0.08)' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 999, position: 'relative', transition: 'width 600ms cubic-bezier(.4,.6,.2,1)' }}>
        <div style={{ position: 'absolute', inset: '2px 2px auto', height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.35),transparent)', borderRadius: 999 }} />
      </div>
    </div>
  )
}

function Avatar({ initials }: { initials: string }) {
  return (
    <div style={{ width: 32, height: 32, borderRadius: 999, background: 'var(--primary)', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, fontFamily: 'var(--f-sans)', flexShrink: 0 }}>
      {initials}
    </div>
  )
}

/* SVG icons */
function HomeIcon({ active }: { active?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-4v-6h-6v6H5a2 2 0 0 1-2-2z"/></svg>
}
function MapIcon({ active }: { active?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M9 3l-6 2v16l6-2 6 2 6-2V3l-6 2-6-2z"/><path d="M9 3v16M15 5v16"/></svg>
}
function CardsIcon({ active }: { active?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="14" height="14" rx="3"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg>
}
function TargetIcon({ active, size = 19 }: { active?: boolean; size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={active ? 'var(--primary-2)' : 'currentColor'} strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={active ? 'var(--primary-2)' : 'currentColor'}/></svg>
}
function LogoutIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/></svg>
}
function UserIcon({ active }: { active?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
}
function BookIcon({ active }: { active?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function ChartIcon({ active }: { active?: boolean }) {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.25 : 2} strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-5 4 3 4-7"/></svg>
}
