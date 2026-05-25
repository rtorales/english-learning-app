import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AddCardForm } from '@/components/vocabulary/AddCardForm'
import { DeleteCardButton } from '@/components/vocabulary/DeleteCardButton'
import type { SRSItem } from '@/generated/prisma/client'

const STATE_META: Record<string, { label: string; bg: string; fg: string }> = {
  New:        { label: 'Nueva',      bg: 'var(--bg-soft)',       fg: 'var(--ink-3)' },
  Learning:   { label: 'Aprendiendo', bg: 'var(--accent-tint)',  fg: '#a07428' },
  Review:     { label: 'Repaso',      bg: 'var(--primary-tint)', fg: 'var(--primary-2)' },
  Relearning: { label: 'Reforzando',  bg: '#fde8e8',             fg: 'var(--coral)' },
}

function formatDate(d: Date | null) {
  if (!d) return '—'
  const now = new Date()
  const diff = Math.round((d.getTime() - now.getTime()) / 86400000)
  if (diff <= 0) return 'Hoy'
  if (diff === 1) return 'Mañana'
  if (diff < 7) return `En ${diff} días`
  return d.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

function pct(v: number) { return `${Math.round(v * 100)}%` }

export default async function VocabularyPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const items = await prisma.sRSItem.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: 'desc' },
  })

  // Group by deck
  const decks: Record<string, SRSItem[]> = {}
  for (const item of items) {
    const key = item.deckName ?? 'Sin mazo'
    if (!decks[key]) decks[key] = []
    decks[key].push(item)
  }
  const deckNames = Object.keys(decks)

  // Global stats
  const total = items.length
  const dueNow = items.filter(i => new Date(i.due) <= new Date()).length
  const mastered = items.filter(i => i.state === 'Review' && i.stability > 21).length
  const avgRetention = items.length
    ? items.reduce((s, i) => s + i.retrievability, 0) / items.length
    : 0

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--ink)', margin: 0 }}>Mi vocabulario</h1>
          <p style={{ marginTop: 6, fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
            {total} tarjeta{total !== 1 ? 's' : ''} en {deckNames.length} mazo{deckNames.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {dueNow > 0 && (
            <Link href="/review" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0 18px', height: 44, borderRadius: 12,
              background: 'var(--accent)', color: '#fff',
              fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14,
              textDecoration: 'none', boxShadow: '0 4px 0 var(--accent-2)',
            }}>
              Repasar ahora · {dueNow}
            </Link>
          )}
          <AddCardForm existingDecks={deckNames} />
        </div>
      </div>

      {/* Global stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
        {[
          { label: 'Total', value: total, icon: '📚', color: 'var(--ink)' },
          { label: 'Para repasar', value: dueNow, icon: '⏰', color: dueNow > 0 ? 'var(--coral)' : 'var(--sage)' },
          { label: 'Dominadas', value: mastered, icon: '🏆', color: 'var(--primary)' },
          { label: 'Retención', value: pct(avgRetention), icon: '🧠', color: 'var(--sage)' },
        ].map(stat => (
          <div key={stat.label} style={{
            background: 'var(--card)', border: '1px solid var(--card-ring)',
            borderRadius: 16, padding: '16px 20px',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <span style={{ fontSize: 20 }}>{stat.icon}</span>
            <span style={{ fontSize: 24, fontWeight: 800, color: stat.color, letterSpacing: '-0.03em', fontFamily: 'var(--f-sans)' }}>{stat.value}</span>
            <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📝</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Aún no tenés tarjetas</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 24 }}>
            Creá tu primera tarjeta de vocabulario para empezar a practicar con el sistema Anki.
          </p>
        </div>
      )}

      {/* Deck sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {deckNames.map(deckName => {
          const deckItems = decks[deckName]
          const counts = { New: 0, Learning: 0, Review: 0, Relearning: 0 }
          for (const item of deckItems) counts[item.state as keyof typeof counts]++

          return (
            <div key={deckName} style={{
              background: 'var(--card)', border: '1px solid var(--card-ring)',
              borderRadius: 20, overflow: 'hidden',
            }}>
              {/* Deck header */}
              <div style={{
                padding: '18px 24px',
                borderBottom: '1px solid var(--card-ring)',
                display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.01em' }}>
                    {deckName}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--ink-3)' }}>
                    {deckItems.length} tarjeta{deckItems.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {(Object.entries(counts) as [string, number][]).map(([state, n]) => n > 0 && (
                    <span key={state} style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: STATE_META[state].bg, color: STATE_META[state].fg,
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {STATE_META[state].label} {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--card-ring)' }}>
                      {['Inglés', 'Traducción', 'Estado', 'Estabilidad', 'Retención', 'Próximo repaso', ''].map(h => (
                        <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left', whiteSpace: 'nowrap' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {deckItems.map((item, idx) => (
                      <tr key={item.id} style={{ borderBottom: idx < deckItems.length - 1 ? '1px solid var(--card-ring)' : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: 15, fontWeight: 700, color: 'var(--ink)', fontFamily: 'var(--f-display)', fontStyle: 'italic' }}>
                          {item.front}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--ink-2)', maxWidth: 240 }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.back}</div>
                          {item.context && (
                            <div style={{ fontSize: 12, color: 'var(--ink-3)', fontStyle: 'italic', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.context}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 700,
                            background: STATE_META[item.state].bg, color: STATE_META[item.state].fg,
                          }}>
                            {STATE_META[item.state].label}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-2)', whiteSpace: 'nowrap' }}>
                          <StabilityBar days={item.stability} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                          <RetentionBadge value={item.retrievability} />
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>
                          {formatDate(item.nextReviewAt ?? item.due)}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <DeleteCardButton cardId={item.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StabilityBar({ days }: { days: number }) {
  const max = 90
  const pct = Math.min(100, (days / max) * 100)
  const color = days < 3 ? 'var(--coral)' : days < 14 ? 'var(--accent)' : 'var(--sage)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 56, height: 6, borderRadius: 999, background: 'var(--bg-soft)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>
        {days < 1 ? '<1d' : `${Math.round(days)}d`}
      </span>
    </div>
  )
}

function RetentionBadge({ value }: { value: number }) {
  const p = Math.round(value * 100)
  const color = p >= 80 ? 'var(--sage)' : p >= 60 ? 'var(--accent)' : 'var(--coral)'
  return <span style={{ color, fontVariantNumeric: 'tabular-nums' }}>{p}%</span>
}
