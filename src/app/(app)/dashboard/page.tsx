import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LearningMap } from '@/components/learning-map/LearningMap'
import type { CEFRLevel } from '@/types'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      progress: { where: { completed: true } },
      srsItems: { where: { due: { lte: new Date() } } },
    },
  })
  if (!dbUser) redirect('/login')
  if (!dbUser.cefrLevel || !dbUser.sector) redirect('/placement')

  const modules = await prisma.learningModule.findMany({
    where: { sector: dbUser.sector },
    orderBy: { orderIndex: 'asc' },
  })

  const completedIds = dbUser.progress.map((p: { moduleId: string }) => p.moduleId)
  const pendingReviews = dbUser.srsItems.length
  const nextModule = modules.find(m => !completedIds.includes(m.id))
  const firstName = (dbUser.name ?? dbUser.email).split(' ')[0]

  const weekXP = [45, 65, 30, 80, 55, dbUser.xp % 100, 0]
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1

  return (
    <div className="page-fade" style={{ padding: '28px 32px 40px' }}>

      {/* Today's lesson hero */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--primary) 0%, #7559a3 100%)',
        borderRadius: 24, padding: 28, color: '#fff',
        display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24,
        minHeight: 200, boxShadow: 'var(--sh-glow)',
        marginBottom: 20,
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, right: 100, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
            <SparklesIcon /> Lección de hoy
          </div>
          <h2 style={{ fontFamily: 'var(--f-sans)', color: '#fff', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15, marginBottom: 8 }}>
            {nextModule?.title ?? 'Code reviews & technical feedback'}
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, lineHeight: 1.55, marginBottom: 20 }}>
            {nextModule?.description ?? 'Vocabulario y frases para dar feedback constructivo y discutir cambios de código.'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {nextModule ? (
              <Link href={`/learn/${nextModule.id}`} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0 20px', height: 54, borderRadius: 14,
                background: 'var(--accent)', color: 'var(--accent-ink)',
                fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15,
                textDecoration: 'none', boxShadow: '0 4px 0 var(--accent-2)',
                textTransform: 'uppercase', letterSpacing: '-0.01em',
              }}>
                Comenzar lección <ArrowRightIcon />
              </Link>
            ) : (
              <span style={{ fontSize: 14, opacity: 0.9 }}>🎉 ¡Todas las lecciones completadas!</span>
            )}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600 }}>
              <ClockIcon /> 12 min
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 600 }}>
              <BoltIcon /> +{nextModule?.xpReward ?? 50} XP
            </span>
            <CefrPill level={dbUser.cefrLevel as CEFRLevel} />
          </div>
        </div>

        {/* Right — quick stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, position: 'relative', zIndex: 1, alignContent: 'start' }}>
          {[
            { l: 'Módulos', v: completedIds.length, sub: 'completados' },
            { l: 'Repasos', v: pendingReviews, sub: 'pendientes' },
            { l: 'Sector', v: dbUser.sector, sub: 'profesional' },
            { l: 'Nivel', v: dbUser.cefrLevel, sub: 'CEFR actual' },
          ].map((t, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', backdropFilter: 'blur(8px)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.l}</div>
              <div style={{ fontSize: typeof t.v === 'string' ? 20 : 22, fontWeight: 800, marginTop: 4, fontFamily: 'var(--f-sans)', letterSpacing: '-0.02em' }}>{t.v}</div>
              <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>{t.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Mini stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        <MiniStat icon={<BoltIcon />} label="XP Total" value={dbUser.xp} color="var(--accent-2)" sublabel="experiencia" />
        <MiniStat icon={<FlameIcon />} label="Racha" value={dbUser.streakDays} color="var(--coral)" sublabel="días seguidos" />
        <MiniStat icon={<CardsIcon />} label="Pendientes" value={pendingReviews} color="var(--primary)" sublabel="repasos hoy" badge={pendingReviews > 0} href="/review" />
        <MiniStat icon={<TrophyIcon />} label="Módulos" value={completedIds.length} color="var(--sage)" sublabel={`de ${modules.length} total`} />
      </div>

      {/* Two-column lower section */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 32 }}>
        {/* Weekly chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 22, boxShadow: 'var(--sh-1)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Esta semana</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Tu actividad</h3>
            </div>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, background: 'var(--sage-soft)', color: 'var(--st-correct-fg)' }}>
              <TrendingIcon size={12} /> +24% esta semana
            </span>
          </div>
          <WeeklyChart days={weekDays} values={weekXP} todayIdx={todayIdx} />
        </div>

        {/* Next in path */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 22, boxShadow: 'var(--sh-1)' }}>
          <div style={{ marginBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Siguiente en tu camino</h3>
            <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>Módulos desbloqueados</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {modules.filter(m => !completedIds.includes(m.id)).slice(0, 3).map((mod, i) => (
              <div key={mod.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 12,
                background: i === 0 ? 'var(--primary-tint)' : 'transparent',
                border: '1px solid ' + (i === 0 ? 'var(--primary-soft)' : 'var(--card-ring)'),
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: i === 0 ? 'var(--primary-soft)' : 'var(--bg-soft)',
                  color: i === 0 ? 'var(--primary-2)' : 'var(--ink-4)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {mod.isBoss ? <TrophyIcon size={17} /> : <BookIcon size={17} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 1 }}>{mod.cefrLevel} · +{mod.xpReward} XP</div>
                </div>
                {i === 0 && <ChevronRightIcon />}
              </div>
            ))}
            {modules.filter(m => !completedIds.includes(m.id)).length === 0 && (
              <p style={{ color: 'var(--ink-3)', fontSize: 13, textAlign: 'center', padding: '16px 0' }}>¡Todo completado! 🎉</p>
            )}
          </div>
        </div>
      </div>

      {/* Learning map */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 22, boxShadow: 'var(--sh-1)' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Mi camino · {dbUser.sector}</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>Mapa de aprendizaje</h3>
        </div>
        <LearningMap
          modules={modules}
          userLevel={dbUser.cefrLevel as CEFRLevel}
          completedModuleIds={completedIds}
          pendingReviews={pendingReviews}
        />
      </div>
    </div>
  )
}

/* ---- Sub-components ---- */
function MiniStat({ icon, label, value, color, sublabel, badge, href }: {
  icon: React.ReactNode; label: string; value: number | string;
  color: string; sublabel?: string; badge?: boolean; href?: string;
}) {
  const content = (
    <div className={href ? 'mini-stat-link' : undefined} style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 16, padding: 16, position: 'relative', overflow: 'hidden', cursor: href ? 'pointer' : 'default' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: `color-mix(in oklab, ${color} 14%, transparent)`, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
        {badge && <span style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: 'var(--coral)' }} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 5, fontFamily: 'var(--f-sans)' }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{typeof value === 'number' ? value.toLocaleString() : value}</span>
        {sublabel && <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{sublabel}</span>}
      </div>
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{content}</Link> : content
}

function WeeklyChart({ days, values, todayIdx }: { days: string[]; values: number[]; todayIdx: number }) {
  const max = Math.max(...values, 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 130, padding: '0 4px' }}>
      {days.map((day, i) => {
        const h = (values[i] / max) * 110
        const isToday = i === todayIdx
        return (
          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 36, height: 110, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              {values[i] > 0 ? (
                <>
                  <span style={{ position: 'absolute', top: 110 - h - 18, left: '50%', transform: 'translateX(-50%)', fontSize: 10, fontWeight: 700, color: isToday ? 'var(--primary-2)' : 'var(--ink-3)', whiteSpace: 'nowrap' }}>{values[i]}</span>
                  <div style={{ width: '100%', height: h, background: isToday ? 'linear-gradient(180deg, var(--primary), var(--primary-2))' : 'var(--primary-soft)', borderRadius: 8, boxShadow: isToday ? '0 2px 8px rgba(139,109,181,0.3)' : 'none', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.35),transparent)', borderRadius: 6 }} />
                  </div>
                </>
              ) : (
                <div style={{ width: '100%', height: 4, background: 'var(--card-ring)', borderRadius: 8 }} />
              )}
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: isToday ? 'var(--primary-2)' : 'var(--ink-3)' }}>{day}</span>
          </div>
        )
      })}
    </div>
  )
}

function CefrPill({ level }: { level: CEFRLevel }) {
  const bg = ['A1', 'A2'].includes(level) ? '#9bc998' : ['B1', 'B2'].includes(level) ? '#e8b961' : '#8b6db5'
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, background: bg, color: '#fff', fontWeight: 800, fontSize: 11, fontFamily: 'var(--f-sans)', letterSpacing: '0.06em' }}>{level}</span>
}

/* Icons */
function SparklesIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z"/><path d="M19 14l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/></svg> }
function ArrowRightIcon() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg> }
function ClockIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> }
function BoltIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg> }
function FlameIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14c0-3 3.5-4 3.5-9 3 2 7 5 7 10a7 7 0 0 1-14 0c0-2 1-3.5 2-4.5 0 1.5.7 2.5 1.5 3.5z"/></svg> }
function CardsIcon() { return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="14" height="14" rx="3"/><path d="M7 3h12a2 2 0 0 1 2 2v12"/></svg> }
function TrophyIcon({ size = 17 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 4h3v2a3 3 0 0 1-3 3M7 4H4v2a3 3 0 0 0 3 3"/></svg> }
function BookIcon({ size = 17 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M4 19a2 2 0 0 1 2-2h13"/></svg> }
function ChevronRightIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary-2)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg> }
function TrendingIcon({ size = 14 }: { size?: number }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg> }
