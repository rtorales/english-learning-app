import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { CEFRLevel } from '@/types'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      progress: { where: { completed: true } },
      srsItems: { select: { id: true, reps: true, retrievability: true, state: true } },
      milestones: { include: { milestone: { select: { key: true, title: true } } } },
    },
  })
  if (!user) redirect('/login')

  const allModules = await prisma.learningModule.findMany({
    where: user.sector ? { sector: user.sector } : {},
    select: { id: true, cefrLevel: true },
  })

  const completedIds = new Set(user.progress.map((p: { moduleId: string }) => p.moduleId))
  const earnedKeys = new Set(user.milestones.map((m: { milestone: { key: string } }) => m.milestone.key))

  const cefrLevels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']
  const cefrLevelLabels: Record<CEFRLevel, string> = {
    A1: 'A1 — Básico inicial',
    A2: 'A2 — Básico',
    B1: 'B1 — Independiente inicial',
    B2: 'B2 — Independiente',
    C1: 'C1 — Avanzado',
    C2: 'C2 — Maestría',
  }
  const cefrProgress = cefrLevels.map(level => {
    const mods = allModules.filter((m: { cefrLevel: string }) => m.cefrLevel === level)
    const done = mods.filter((m: { id: string }) => completedIds.has(m.id)).length
    const total = mods.length
    return { level, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 }
  })

  const reviewedItems = user.srsItems.filter((i: { reps: number }) => i.reps > 0).length
  const avgRetention = user.srsItems.length > 0
    ? Math.round(user.srsItems.reduce((sum: number, i: { retrievability: number }) => sum + i.retrievability, 0) / user.srsItems.length * 100)
    : 0

  const userName = user.name ?? user.email.split('@')[0]
  const initials = userName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const joinDate = new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(user.createdAt)
  const sectorLabel = {
    tech: 'Software / IT', business: 'Negocios', data: 'Datos',
    engineering: 'Ingeniería', healthcare: 'Salud',
  }[user.sector ?? 'tech'] ?? 'General'

  const achievements = [
    { key: 'streak_3',     icon: 'flame',  color: 'var(--coral)',    label: 'Racha 3d',    unlocked: user.streakDays >= 3 },
    { key: 'streak_7',     icon: 'flame',  color: 'var(--coral)',    label: 'Semana',      unlocked: earnedKeys.has('streak_7') },
    { key: 'xp_500',       icon: 'bolt',   color: 'var(--accent-2)', label: '500 XP',      unlocked: user.xp >= 500 },
    { key: 'xp_1000',      icon: 'bolt',   color: 'var(--accent-2)', label: '1000 XP',     unlocked: user.xp >= 1000 },
    { key: 'first_lesson', icon: 'star',   color: 'var(--primary)',  label: '1ª lección',  unlocked: earnedKeys.has('first_lesson') || completedIds.size > 0 },
    { key: 'first_review', icon: 'cards',  color: 'var(--primary)',  label: '1er repaso',  unlocked: earnedKeys.has('first_review') || reviewedItems > 0 },
    { key: 'level_b1',     icon: 'trophy', color: 'var(--sage)',     label: 'Nivel B1',    unlocked: earnedKeys.has('level_b1') || ['B1','B2','C1','C2'].includes(user.cefrLevel ?? '') },
    { key: 'vocab_100',    icon: 'lock',   color: 'var(--ink-4)',    label: '?',           unlocked: false },
  ]

  const unlockedCount = achievements.filter(a => a.unlocked).length

  const userLevel = user.level ?? 1
  const levelXP = user.xp

  const cefrColor = (level: string) => {
    if (['A1', 'A2'].includes(level)) return 'var(--sage)'
    if (['B1', 'B2'].includes(level)) return 'var(--accent-2)'
    return 'var(--primary)'
  }

  return (
    <div className="page-fade" style={{ padding: '26px 32px 40px' }}>

      {/* Profile hero */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'auto 1fr auto',
        gap: 24, alignItems: 'center',
        padding: 22,
        background: 'var(--card)', border: '1px solid var(--card-ring)',
        borderRadius: 20, boxShadow: 'var(--sh-1)',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            width: 88, height: 88, borderRadius: 999,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 32, fontWeight: 800, fontFamily: 'var(--f-sans)',
          }}>
            {initials}
          </div>
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 28, height: 28, borderRadius: 999,
            background: 'var(--accent)', color: '#fff',
            border: '3px solid var(--card)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, fontFamily: 'var(--f-sans)',
          }}>
            {userLevel}
          </div>
        </div>

        <div>
          <h2 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--ink)', marginBottom: 4 }}>
            {userName}
          </h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            {sectorLabel} · se unió en {joinDate}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            {user.cefrLevel && <CefrPill level={user.cefrLevel as CEFRLevel} />}
            <Badge icon="bolt" color="var(--primary-2)" bg="var(--primary-tint)" border="var(--primary-soft)">
              Nivel {userLevel} · {levelXP.toLocaleString()} XP
            </Badge>
            {avgRetention > 0 && (
              <Badge icon="trending" color="var(--st-correct-fg)" bg="var(--sage-soft)" border="color-mix(in oklab, var(--sage) 30%, transparent)">
                {avgRetention}% retención
              </Badge>
            )}
          </div>
        </div>

        <button style={{
          padding: '10px 18px', borderRadius: 12,
          background: 'var(--card)', border: '1px solid var(--card-ring)',
          color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14,
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
          boxShadow: '0 2px 0 var(--card-ring)',
        }}>
          <EditIcon /> Editar
        </button>
      </div>

      {/* Two-column body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 16, marginTop: 18 }}>

        {/* Left: mini-stats + CEFR */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <MiniStat icon={<CardsIcon />} label="Tarjetas dominadas" value={reviewedItems} sublabel={`de ${user.srsItems.length}`} color="var(--primary)" trend="+24 esta semana" />
          <MiniStat icon={<BookIcon />}  label="Lecciones"          value={completedIds.size} sublabel={`de ${allModules.length}`} color="var(--sage)" />
          <MiniStat icon={<ClockIcon />} label="Minutos totales"    value={Math.round(completedIds.size * 12 + reviewedItems * 0.5)} sublabel="min aprox." color="var(--accent-2)" />
          <MiniStat icon={<TargetIcon />}label="Retención FSRS"     value={avgRetention || 0} sublabel="% proyectado" color="var(--coral)" trend="Objetivo: 90%" />

          {/* CEFR progress — spans 2 cols */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18, padding: 20, boxShadow: 'var(--sh-1)' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Tu camino</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.02em' }}>Progreso CEFR</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>Tu camino hacia el nivel objetivo ({user.cefrLevel ?? 'B2'})</p>
              </div>
              {cefrProgress.map(({ level, pct, done, total }, i) => {
                const isActive = level === user.cefrLevel
                return (
                  <div key={level} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '10px 0',
                    borderBottom: i < cefrProgress.length - 1 ? '1px solid var(--card-ring)' : 'none',
                  }}>
                    <CefrPill level={level as CEFRLevel} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--ink)' : 'var(--ink-2)' }}>
                          {cefrLevelLabels[level as CEFRLevel]}
                          {isActive && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--primary-2)', fontWeight: 700 }}>← actual</span>}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
                          {total > 0 ? `${done}/${total} · ${pct}%` : '—'}
                        </span>
                      </div>
                      <ProgressBar value={pct} max={100} color={pct === 100 ? 'var(--sage)' : cefrColor(level)} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: achievements + milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18, padding: 20, boxShadow: 'var(--sh-1)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em' }}>Logros desbloqueados</h3>
              </div>
              <span style={{ padding: '3px 10px', borderRadius: 999, background: 'var(--bg-soft)', border: '1px solid var(--card-ring)', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--f-sans)' }}>
                {unlockedCount} / {achievements.length}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {achievements.map((b) => (
                <div key={b.key} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  padding: '10px 6px',
                  background: b.unlocked ? 'var(--card-2)' : 'var(--bg-soft)',
                  border: '1px solid var(--card-ring)', borderRadius: 12,
                  opacity: b.unlocked ? 1 : 0.55,
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 12,
                    background: `color-mix(in oklab, ${b.color} 16%, transparent)`,
                    color: b.color,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AchievementIcon name={b.icon} />
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-2)', textAlign: 'center', lineHeight: 1.2 }}>{b.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18, padding: 20, boxShadow: 'var(--sh-1)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14 }}>Próximos hitos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: 'flame',  label: 'Racha de 30 días',      current: user.streakDays, max: 30,   color: 'var(--coral)' },
                { icon: 'bolt',   label: '2,000 XP totales',      current: user.xp,          max: 2000, color: 'var(--accent-2)' },
                { icon: 'cards',  label: '500 tarjetas revisadas', current: reviewedItems,    max: 500,  color: 'var(--primary)' },
              ].map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                    background: `color-mix(in oklab, ${g.color} 16%, transparent)`,
                    color: g.color,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <AchievementIcon name={g.icon} size={17} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{g.label}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
                        {Math.min(g.current, g.max).toLocaleString()}/{g.max.toLocaleString()}
                      </span>
                    </div>
                    <ProgressBar value={Math.min(g.current, g.max)} max={g.max} color={g.color} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* XP breakdown */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18, padding: 20, boxShadow: 'var(--sh-1)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14 }}>Resumen de XP</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <XPRow label="Lecciones completadas" value={completedIds.size * 50} color="var(--sage)" />
              <XPRow label="Repasos SRS"            value={reviewedItems * 10}   color="var(--primary)" />
              <XPRow label="Rachas y bonos"         value={user.xp - completedIds.size * 50 - reviewedItems * 10} color="var(--accent-2)" />
              <div style={{ borderTop: '1px solid var(--card-ring)', paddingTop: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Total</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>
                  {user.xp.toLocaleString()} XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */

function MiniStat({ icon, label, value, color, sublabel, trend }: {
  icon: React.ReactNode; label: string; value: number;
  color: string; sublabel?: string; trend?: string;
}) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 16, padding: 16, boxShadow: 'var(--sh-1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklab, ${color} 14%, transparent)`, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontFamily: 'var(--f-sans)' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{value.toLocaleString()}</span>
        {sublabel && <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{sublabel}</span>}
      </div>
      {trend && <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6, fontWeight: 600 }}>{trend}</p>}
    </div>
  )
}

function ProgressBar({ value, max = 100, color = 'var(--primary)' }: { value: number; max?: number; color?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ height: 6, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 600ms ease' }} />
    </div>
  )
}

function CefrPill({ level }: { level: CEFRLevel }) {
  const bg = ['A1', 'A2'].includes(level) ? '#9bc998' : ['B1', 'B2'].includes(level) ? '#e8b961' : '#8b6db5'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, background: bg, color: '#fff', fontWeight: 800, fontSize: 11, fontFamily: 'var(--f-sans)', letterSpacing: '0.06em' }}>
      {level}
    </span>
  )
}

function Badge({ icon, color, bg, border, children }: { icon: string; color: string; bg: string; border: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999, background: bg, border: `1px solid ${border}`, color, fontWeight: 700, fontSize: 12, fontFamily: 'var(--f-sans)' }}>
      <AchievementIcon name={icon} size={13} />
      {children}
    </span>
  )
}

function XPRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{label}</span>
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', fontFamily: 'var(--f-mono)' }}>
        {Math.max(0, value).toLocaleString()} XP
      </span>
    </div>
  )
}

function AchievementIcon({ name, size = 20 }: { name: string; size?: number }) {
  const s = `width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"`
  if (name === 'flame')   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M8.5 14c0-3 3.5-4 3.5-9 3 2 7 5 7 10a7 7 0 0 1-14 0c0-2 1-3.5 2-4.5 0 1.5.7 2.5 1.5 3.5z"/></svg>
  if (name === 'bolt')    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>
  if (name === 'star')    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>
  if (name === 'cards')   return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><rect x="3" y="7" width="14" height="14" rx="3"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg>
  if (name === 'trophy')  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 4h3v2a3 3 0 0 1-3 3M7 4H4v2a3 3 0 0 0 3 3"/></svg>
  if (name === 'trending') return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
  // lock / default
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
}

function EditIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
}
function CardsIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><rect x="3" y="7" width="14" height="14" rx="3"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg> }
function BookIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg> }
function ClockIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> }
function TargetIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg> }
