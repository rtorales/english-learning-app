import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { LearningMap } from '@/components/learning-map/LearningMap'
import type { CEFRLevel } from '@/types'
import { CEFR_ORDER } from '@/types'

const SECTIONS: { label: string; levels: CEFRLevel[]; cefrDisplay: string }[] = [
  { label: 'Fundamentos',            levels: ['A1', 'A2'],       cefrDisplay: 'A1–A2' },
  { label: 'Comunicación profesional', levels: ['B1'],           cefrDisplay: 'B1'    },
  { label: 'Nivel avanzado',         levels: ['B2'],             cefrDisplay: 'B2'    },
  { label: 'Maestría',               levels: ['C1', 'C2'],       cefrDisplay: 'C1–C2' },
]

export default async function MapPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      progress: { where: { completed: true } },
      srsItems: { where: { due: { lte: new Date() } }, select: { id: true } },
    },
  })
  if (!user) redirect('/login')
  if (!user.cefrLevel || !user.sector) redirect('/placement')

  const modules = await prisma.learningModule.findMany({
    where: { sector: user.sector },
    orderBy: { orderIndex: 'asc' },
  })

  const completedIds = user.progress.map((p: { moduleId: string }) => p.moduleId)
  const pendingReviews = user.srsItems.length

  const userOrder = CEFR_ORDER[user.cefrLevel as CEFRLevel]

  const sectorLabel = {
    tech: 'Software / IT', business: 'Negocios', data: 'Datos',
    engineering: 'Ingeniería', healthcare: 'Salud',
  }[user.sector] ?? 'General'

  // Build section progress data
  const sections = SECTIONS.map(sec => {
    const secModules = modules.filter(m => sec.levels.includes(m.cefrLevel as CEFRLevel))
    const done = secModules.filter(m => completedIds.includes(m.id)).length
    const total = secModules.length
    const isCurrent = secModules.some(m => {
      const mOrder = CEFR_ORDER[m.cefrLevel as CEFRLevel]
      return mOrder <= userOrder + 1 && !completedIds.includes(m.id)
    })
    return { ...sec, done, total, isCurrent }
  })

  // Active section index (first section with incomplete modules accessible to user)
  const activeSectionIdx = sections.findIndex(s => s.isCurrent)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Section navigation row */}
      <div style={{
        padding: '14px 28px',
        borderBottom: '1px solid var(--card-ring)',
        background: 'var(--bg)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
        overflowX: 'auto',
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-3)', marginRight: 6, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {sectorLabel}
        </div>
        <div style={{ width: 1, height: 18, background: 'var(--card-ring)', flexShrink: 0 }} />
        {sections.map((sec, i) => {
          const isActive = i === activeSectionIdx
          const isComplete = sec.done === sec.total && sec.total > 0
          return (
            <div key={sec.label} style={{
              flex: '1 1 0', minWidth: 130,
              padding: '8px 12px',
              borderRadius: 12,
              background: isActive ? 'var(--primary-tint)' : isComplete ? 'var(--sage-soft)' : 'transparent',
              border: '1px solid ' + (
                isActive ? 'color-mix(in oklab, var(--primary) 25%, transparent)'
                  : isComplete ? 'color-mix(in oklab, var(--sage) 30%, transparent)'
                  : 'var(--card-ring)'
              ),
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: isActive ? 'var(--primary-2)' : isComplete ? 'var(--st-correct-fg)' : 'var(--ink-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {sec.label}
                </span>
                <CefrPill level={sec.cefrDisplay} active={isActive} done={isComplete} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1, height: 5, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden' }}>
                  <div style={{
                    width: sec.total > 0 ? `${Math.round((sec.done / sec.total) * 100)}%` : '0%',
                    height: '100%',
                    background: isComplete ? 'var(--sage)' : isActive ? 'var(--primary)' : 'var(--card-ring)',
                    borderRadius: 999,
                    transition: 'width 600ms ease',
                  }} />
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', whiteSpace: 'nowrap', fontFamily: 'var(--f-mono)' }}>
                  {sec.done}/{sec.total}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Map scroll area */}
      <div style={{
        flex: 1, overflow: 'auto',
        background: 'linear-gradient(180deg, var(--bg) 0%, var(--bg-soft) 100%)',
        position: 'relative',
      }}>
        {/* Dot grid */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          backgroundImage: 'radial-gradient(var(--card-ring) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          opacity: 0.55,
        }} />

        {/* Current section pill */}
        {activeSectionIdx >= 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 20, position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '8px 18px',
              background: 'var(--card)', border: '1px solid var(--card-ring)',
              borderRadius: 999, boxShadow: 'var(--sh-1)',
            }}>
              <LeafIcon />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Sección {activeSectionIdx + 1} de {sections.length}
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                {sections[activeSectionIdx]?.label}
              </span>
              <CefrPill level={sections[activeSectionIdx]?.cefrDisplay} active />
            </div>
          </div>
        )}

        {/* Map */}
        <div style={{ padding: '16px 32px 60px', position: 'relative', zIndex: 1 }}>
          <LearningMap
            modules={modules}
            userLevel={user.cefrLevel as CEFRLevel}
            completedModuleIds={completedIds}
            pendingReviews={pendingReviews}
          />
        </div>
      </div>
    </div>
  )
}

function CefrPill({ level, active, done }: { level: string; active?: boolean; done?: boolean }) {
  const bg = done ? '#9bc998' : active ? 'var(--primary)' : 'var(--bg-soft)'
  const color = done || active ? '#fff' : 'var(--ink-3)'
  const border = done || active ? 'transparent' : 'var(--card-ring)'
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 8px', borderRadius: 999,
      background: bg, color, border: `1px solid ${border}`,
      fontWeight: 800, fontSize: 10, fontFamily: 'var(--f-sans)',
      letterSpacing: '0.05em', flexShrink: 0,
    }}>
      {level}
    </span>
  )
}

function LeafIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--sage)" strokeWidth="2.25" strokeLinecap="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  )
}
