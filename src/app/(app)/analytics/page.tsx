import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const CEFR_ORDER = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const CEFR_TIPS: Record<string, { title: string; tips: string[] }> = {
  A1: {
    title: 'Fundamentos del idioma',
    tips: [
      'Repetición espaciada diaria (10-15 min) — priorizá las 500 palabras más comunes.',
      'Escuchá audio simple: canciones, instrucciones básicas, podcasts para A1.',
      'Mínimo 3 tarjetas nuevas por día. La consistencia supera la intensidad.',
      'Usá imágenes junto con la palabra — la memoria visual acelera el aprendizaje.',
    ],
  },
  A2: {
    title: 'Construyendo fluidez básica',
    tips: [
      'Incrementá a 5 tarjetas nuevas por día. Enfocá en verbos comunes y phrasal verbs básicos.',
      'Mirá series con subtítulos en inglés, no en español.',
      'Escribí al menos 3 oraciones simples por día usando vocabulario nuevo.',
      'Escuchá podcasts "slow English" — entender el ritmo natural es clave.',
    ],
  },
  B1: {
    title: 'Hacia la comunicación funcional',
    tips: [
      'SRS 15-20 min/día · 1 lección 3x por semana · 5 tarjetas nuevas por día.',
      'Leé artículos técnicos cortos de tu sector (tech, negocios, etc.).',
      'Practicá phrasal verbs en contexto — son esenciales para entender nativos.',
      'Enfocá en conectores y expresiones de transición para hablar con coherencia.',
    ],
  },
  B2: {
    title: 'Comunicación avanzada y matices',
    tips: [
      'Consumí contenido nativo sin subtítulos: podcasts, YouTube técnico, noticias.',
      'Escribí resúmenes de lo que leés — fuerza el procesamiento activo del vocabulario.',
      'Expandí colocaciones y frases idiomáticas. Las palabras sueltas ya no son el límite.',
      'Practicá presentaciones orales improvisadas de 2 minutos sobre temas de tu sector.',
    ],
  },
  C1: {
    title: 'Dominio y refinamiento',
    tips: [
      'Leé papers y documentación técnica original en inglés.',
      'Escribí emails, reportes y documentación profesional en inglés.',
      'Participá en foros técnicos en inglés (Stack Overflow, GitHub discussions).',
      'Estudiá registro formal vs. informal — las diferencias sutiles te llevan al C2.',
    ],
  },
  C2: {
    title: 'Maestría — mantenimiento',
    tips: [
      'Consumí contenido avanzado: The Economist, academic papers, documentales técnicos.',
      'Ayudá a otros usuarios — enseñar consolida el propio conocimiento.',
      'Escribí contenido original: artículos, posts, documentación para tu equipo.',
      'Estudiá dialectos y variaciones regionales para comunicarte con nativos de todo el mundo.',
    ],
  },
}

function formatDuration(secs: number | null) {
  if (!secs) return '—'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return m > 0 ? `${m}m ${s}s` : `${s}s`
}

export default async function AnalyticsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [user, items, sessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.userId },
      select: { cefrLevel: true, xp: true, level: true, streakDays: true, name: true },
    }),
    prisma.sRSItem.findMany({
      where: { userId: session.userId },
      select: { state: true, retrievability: true, stability: true, lapses: true, front: true, deckName: true, createdAt: true },
      orderBy: { lapses: 'desc' },
    }),
    prisma.studySession.findMany({
      where: { userId: session.userId },
      select: { type: true, totalItems: true, correctItems: true, xpEarned: true, durationSecs: true, startedAt: true, endedAt: true },
      orderBy: { startedAt: 'desc' },
      take: 50,
    }),
  ])

  const cefrLevel = user?.cefrLevel ?? 'B1'
  const cefrIdx = CEFR_ORDER.indexOf(cefrLevel)

  // SRS state funnel
  const stateCounts = { New: 0, Learning: 0, Review: 0, Relearning: 0 }
  let totalRetention = 0
  for (const item of items) {
    stateCounts[item.state as keyof typeof stateCounts]++
    totalRetention += item.retrievability
  }
  const avgRetention = items.length ? totalRetention / items.length : 0
  const mastered = items.filter(i => i.state === 'Review' && i.stability > 21).length

  // Hardest cards (most lapses)
  const hardest = items.filter(i => i.lapses > 0).slice(0, 5)

  // Session stats
  const totalSessions = sessions.length
  const totalItems = sessions.reduce((s, sess) => s + sess.totalItems, 0)
  const totalCorrect = sessions.reduce((s, sess) => s + sess.correctItems, 0)
  const totalXP = sessions.reduce((s, sess) => s + sess.xpEarned, 0)
  const totalMinutes = Math.round(sessions.reduce((s, sess) => s + (sess.durationSecs ?? 0), 0) / 60)
  const sessionAccuracy = totalItems > 0 ? totalCorrect / totalItems : 0

  // Last 7 days session counts (by day index)
  const now = new Date()
  const weekActivity: number[] = Array(7).fill(0)
  for (const sess of sessions) {
    const diff = Math.floor((now.getTime() - new Date(sess.startedAt).getTime()) / 86400000)
    if (diff < 7) weekActivity[6 - diff]++
  }
  const weekMax = Math.max(...weekActivity, 1)

  // By type breakdown
  const byType: Record<string, number> = {}
  for (const sess of sessions) {
    byType[sess.type] = (byType[sess.type] ?? 0) + 1
  }

  const tips = CEFR_TIPS[cefrLevel] ?? CEFR_TIPS.B1

  return (
    <div style={{ padding: '32px 40px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: '0 0 6px' }}>Mi progreso</h1>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-3)' }}>
          Panel de aprendizaje personalizado · Nivel {cefrLevel}
        </p>
      </div>

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Sesiones', value: totalSessions, icon: '📅', color: 'var(--primary)' },
          { label: 'Min estudiados', value: totalMinutes, icon: '⏱️', color: 'var(--ink)' },
          { label: 'Precisión', value: `${Math.round(sessionAccuracy * 100)}%`, icon: '🎯', color: sessionAccuracy >= 0.8 ? 'var(--sage)' : 'var(--accent)' },
          { label: 'XP ganado', value: `+${totalXP}`, icon: '⚡', color: 'var(--accent)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card)', border: '1px solid var(--card-ring)',
            borderRadius: 16, padding: '18px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: stat.color, letterSpacing: '-0.03em', fontFamily: 'var(--f-sans)', fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600, marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* SRS Funnel */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Estado de tarjetas</h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Aún no tenés tarjetas. <Link href="/vocabulary" style={{ color: 'var(--primary)', fontWeight: 700 }}>Crear tarjetas →</Link></p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {([
                { key: 'New',        label: 'Nuevas',       color: 'var(--ink-3)', bg: 'var(--bg-soft)' },
                { key: 'Learning',   label: 'Aprendiendo',  color: '#a07428',      bg: 'var(--accent-tint)' },
                { key: 'Review',     label: 'En repaso',    color: 'var(--primary-2)', bg: 'var(--primary-tint)' },
                { key: 'Relearning', label: 'Reforzando',   color: 'var(--coral)', bg: '#fde8e8' },
              ] as const).map(({ key, label, color, bg }) => {
                const n = stateCounts[key as keyof typeof stateCounts]
                const pctW = items.length ? (n / items.length) * 100 : 0
                return (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{n}</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-soft)', overflow: 'hidden' }}>
                      <div style={{ width: `${pctW}%`, height: '100%', background: color === 'var(--ink-3)' ? 'var(--bg-soft)' : bg, borderRadius: 999, border: `1px solid ${color}`, transition: 'width 600ms ease' }} />
                    </div>
                  </div>
                )
              })}
              <div style={{ marginTop: 8, paddingTop: 12, borderTop: '1px solid var(--card-ring)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Retención promedio</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: avgRetention >= 0.8 ? 'var(--sage)' : 'var(--accent)' }}>{Math.round(avgRetention * 100)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Dominadas (21+ días)</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>{mastered}</span>
              </div>
            </div>
          )}
        </div>

        {/* Activity last 7 days */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: '0 0 18px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Actividad — últimos 7 días</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 100 }}>
            {weekActivity.map((n, i) => {
              const h = Math.max(8, (n / weekMax) * 88)
              const dayLabel = ['D', 'L', 'M', 'X', 'J', 'V', 'S']
              const dayIdx = (now.getDay() - (6 - i) + 7) % 7
              const isToday = i === 6
              return (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: '100%', height: h, borderRadius: 6,
                    background: n > 0 ? 'var(--primary)' : 'var(--bg-soft)',
                    border: isToday ? '2px solid var(--primary-2)' : 'none',
                    position: 'relative', overflow: 'hidden',
                  }}>
                    {n > 0 && <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: '30%', background: 'rgba(255,255,255,0.2)', borderRadius: 4 }} />}
                  </div>
                  <span style={{ fontSize: 10, color: isToday ? 'var(--primary-2)' : 'var(--ink-3)', fontWeight: isToday ? 700 : 600 }}>{dayLabel[dayIdx]}</span>
                </div>
              )
            })}
          </div>
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--card-ring)', display: 'flex', gap: 20 }}>
            {Object.entries(byType).slice(0, 3).map(([type, count]) => (
              <div key={type}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>
                  {type === 'lesson' ? 'Lecciones' : type === 'srs_review' ? 'SRS' : 'Placement'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CEFR Progress */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 24, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 20px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Progresión CEFR</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
          {CEFR_ORDER.map((lvl, i) => {
            const done = i < cefrIdx
            const current = i === cefrIdx
            const color = ['A1', 'A2'].includes(lvl) ? 'var(--sage)' : ['B1', 'B2'].includes(lvl) ? 'var(--accent)' : 'var(--primary)'
            return (
              <div key={lvl} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, position: 'relative' }}>
                {i < CEFR_ORDER.length - 1 && (
                  <div style={{ position: 'absolute', top: 14, left: '50%', width: '100%', height: 3, background: done ? color : 'var(--bg-soft)', zIndex: 0 }} />
                )}
                <div style={{
                  width: 28, height: 28, borderRadius: 999, zIndex: 1, position: 'relative',
                  background: done ? color : current ? 'var(--card)' : 'var(--bg-soft)',
                  border: current ? `3px solid ${color}` : done ? 'none' : '2px solid var(--card-ring)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>}
                  {current && <div style={{ width: 10, height: 10, borderRadius: 999, background: color }} />}
                </div>
                <span style={{ fontSize: 12, fontWeight: current ? 800 : 600, color: done ? color : current ? color : 'var(--ink-3)', letterSpacing: '0.03em' }}>{lvl}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Hardest cards */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Palabras más difíciles</h3>
          {hardest.length === 0 ? (
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Aún no hay datos de errores.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {hardest.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ width: 20, textAlign: 'center', fontSize: 12, color: 'var(--ink-3)', fontWeight: 700 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>{item.front}</span>
                    {item.deckName && <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 8 }}>{item.deckName}</span>}
                  </div>
                  <span style={{
                    padding: '3px 8px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: '#fde8e8', color: 'var(--coral)',
                  }}>
                    {item.lapses}x error
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session history */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Sesiones recientes</h3>
          {sessions.length === 0 ? (
            <p style={{ color: 'var(--ink-3)', fontSize: 13 }}>Aún no completaste sesiones.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {sessions.slice(0, 5).map((sess, i) => {
                const acc = sess.totalItems > 0 ? Math.round((sess.correctItems / sess.totalItems) * 100) : null
                const color = acc === null ? 'var(--ink-3)' : acc >= 80 ? 'var(--sage)' : acc >= 60 ? 'var(--accent)' : 'var(--coral)'
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 16 }}>{sess.type === 'lesson' ? '📖' : sess.type === 'srs_review' ? '🗂️' : '🎯'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>
                        {sess.type === 'lesson' ? 'Lección' : sess.type === 'srs_review' ? 'Repaso SRS' : 'Placement test'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {new Date(sess.startedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} · {formatDuration(sess.durationSecs)}
                      </div>
                    </div>
                    {acc !== null && (
                      <span style={{ fontSize: 13, fontWeight: 700, color }}>{acc}%</span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 700 }}>+{sess.xpEarned}XP</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Adaptive Recommendations */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-tint), var(--bg-soft))',
        border: '1px solid var(--card-ring)', borderRadius: 20, padding: 28,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12, background: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <span style={{ fontSize: 22 }}>🧭</span>
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary-2)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Nivel {cefrLevel} — Recomendaciones personalizadas
            </div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{tips.title}</h3>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tips.tips.map((tip, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 24, height: 24, borderRadius: 999, background: 'var(--primary)',
                color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1,
              }}>{i + 1}</div>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.55 }}>{tip}</p>
            </div>
          ))}
        </div>
        {cefrIdx < CEFR_ORDER.length - 1 && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--card-ring)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Próximo nivel:</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--primary)' }}>{CEFR_ORDER[cefrIdx + 1]}</span>
            <Link href="/placement" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 700, color: 'var(--primary-2)', textDecoration: 'none' }}>
              Hacer test CEFR →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
