'use client'

import { motion } from 'framer-motion'
import { MapNode } from './MapNode'
import type { LearningModule } from '@/generated/prisma/client'
import type { CEFRLevel, MapNode as MapNodeType } from '@/types'
import { CEFR_ORDER } from '@/types'
import Link from 'next/link'

interface LearningMapProps {
  modules: LearningModule[]
  userLevel: CEFRLevel
  completedModuleIds: string[]
  pendingReviews: number
}

// Serpentine X positions (node top-left) in a 380px-wide container (node size = 70px)
// Cycle: center → right-center → far-right → right-center → center → left-center → far-left → left-center
const SNAKE_X = [155, 225, 265, 225, 155, 85, 45, 85]
const NODE_SIZE = 70
const NODE_SPACING = 128  // vertical gap between node tops
const BANNER_SPACE = 72   // extra vertical space consumed by a section banner

const CEFR_COLORS: Record<string, { bg: string; fg: string; label: string }> = {
  A1: { bg: '#9bc998', fg: '#fff', label: 'Principiante' },
  A2: { bg: '#6db56a', fg: '#fff', label: 'Básico' },
  B1: { bg: '#e8b961', fg: '#fff', label: 'Intermedio' },
  B2: { bg: '#d4973a', fg: '#fff', label: 'Intermedio alto' },
  C1: { bg: '#8b6db5', fg: '#fff', label: 'Avanzado' },
  C2: { bg: '#6a4d9c', fg: '#fff', label: 'Maestría' },
}

type LayoutItem =
  | { type: 'banner'; cefrLevel: CEFRLevel; y: number }
  | { type: 'node'; node: MapNodeType; y: number }

export function LearningMap({ modules, userLevel, completedModuleIds, pendingReviews }: LearningMapProps) {
  if (modules.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--ink-3)', fontSize: 14 }}>
        El mapa se generará tras completar tu test de posicionamiento.
      </div>
    )
  }

  const userOrder = CEFR_ORDER[userLevel]

  // Find the "current" node: first unlocked non-completed module
  let foundCurrent = false

  let currentY = 0
  let nodeIndex = 0
  let prevCefrLevel: string | null = null
  const layoutItems: LayoutItem[] = []

  for (const mod of modules) {
    // Insert section banner when CEFR level changes
    if (mod.cefrLevel !== prevCefrLevel) {
      layoutItems.push({ type: 'banner', cefrLevel: mod.cefrLevel as CEFRLevel, y: currentY })
      currentY += BANNER_SPACE
      prevCefrLevel = mod.cefrLevel
    }

    const moduleOrder = CEFR_ORDER[mod.cefrLevel as CEFRLevel]
    const isCompleted = completedModuleIds.includes(mod.id)
    const isUnlocked = moduleOrder <= userOrder + 1
    const isCurrent = !foundCurrent && isUnlocked && !isCompleted
    if (isCurrent) foundCurrent = true

    const x = SNAKE_X[nodeIndex % SNAKE_X.length]

    layoutItems.push({
      type: 'node',
      y: currentY,
      node: {
        id: mod.id,
        title: mod.title,
        moduleId: mod.id,
        cefrLevel: mod.cefrLevel as CEFRLevel,
        isCompleted,
        isUnlocked,
        isCurrent,
        isCheckpoint: mod.isCheckpoint,
        isBoss: mod.isBoss,
        xpReward: mod.xpReward,
        position: { x, y: currentY },
      },
    })

    currentY += NODE_SPACING
    nodeIndex++
  }

  const totalHeight = currentY + NODE_SIZE + 24
  const nodeItems = layoutItems.filter(i => i.type === 'node') as Extract<LayoutItem, { type: 'node' }>[]

  // Build SVG path data connecting consecutive node centers
  const paths: string[] = []
  for (let i = 0; i < nodeItems.length - 1; i++) {
    const a = nodeItems[i].node.position
    const b = nodeItems[i + 1].node.position
    const cx1 = a.x + NODE_SIZE / 2
    const cy1 = a.y + NODE_SIZE / 2
    const cx2 = b.x + NODE_SIZE / 2
    const cy2 = b.y + NODE_SIZE / 2
    const midY = (cy1 + cy2) / 2
    paths.push(`M ${cx1} ${cy1} C ${cx1} ${midY} ${cx2} ${midY} ${cx2} ${cy2}`)
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Pending reviews banner */}
      {pendingReviews > 0 && (
        <Link href="/review" style={{ textDecoration: 'none' }}>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', marginBottom: 24,
              background: 'color-mix(in oklab, var(--primary) 10%, var(--card))',
              border: '1px solid var(--primary-soft)',
              borderRadius: 14, cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: 'var(--primary-soft)', color: 'var(--primary-2)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CardsIcon />
              </div>
              <div>
                <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--ink)', margin: 0 }}>
                  Repasos pendientes
                </p>
                <p style={{ fontSize: 12, color: 'var(--ink-3)', margin: '2px 0 0' }}>
                  {pendingReviews} tarjeta{pendingReviews !== 1 ? 's' : ''} lista{pendingReviews !== 1 ? 's' : ''} para revisar
                </p>
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '6px 14px', borderRadius: 999,
              background: 'var(--primary)', color: 'var(--primary-ink)',
              fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 12,
              textTransform: 'uppercase', letterSpacing: '0.02em',
              boxShadow: '0 3px 0 var(--primary-2)',
            }}>
              Repasar · {pendingReviews}
            </div>
          </motion.div>
        </Link>
      )}

      {/* Map container */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 380, margin: '0 auto', height: totalHeight }}>
        {/* SVG connecting paths */}
        <svg
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          viewBox={`0 0 380 ${totalHeight}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {paths.map((d, i) => {
            const fromNode = nodeItems[i].node
            const toNode = nodeItems[i + 1].node
            const isCompleted = fromNode.isCompleted
            const isUnlocked = toNode.isUnlocked
            return (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={isCompleted ? 'var(--primary-soft)' : isUnlocked ? 'var(--card-ring)' : 'var(--bg-soft)'}
                strokeWidth={isCompleted ? 4 : 3}
                strokeDasharray={!isUnlocked ? '6 5' : undefined}
                strokeLinecap="round"
              />
            )
          })}
        </svg>

        {/* Section banners */}
        {layoutItems.filter(i => i.type === 'banner').map(item => {
          if (item.type !== 'banner') return null
          const colors = CEFR_COLORS[item.cefrLevel] ?? CEFR_COLORS.A1
          return (
            <div
              key={`banner-${item.cefrLevel}-${item.y}`}
              style={{
                position: 'absolute',
                top: item.y + 6,
                left: 0, right: 0,
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px',
                background: `${colors.bg}22`,
                border: `1px solid ${colors.bg}55`,
                borderRadius: 12,
              }}
            >
              <span style={{
                display: 'inline-flex', padding: '3px 10px',
                borderRadius: 999, background: colors.bg, color: colors.fg,
                fontWeight: 800, fontSize: 11, fontFamily: 'var(--f-sans)', letterSpacing: '0.06em',
              }}>
                {item.cefrLevel}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>
                {colors.label}
              </span>
            </div>
          )
        })}

        {/* Nodes */}
        {nodeItems.map((item, i) => (
          <motion.div
            key={item.node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 200, damping: 18 }}
            style={{
              position: 'absolute',
              left: item.node.position.x,
              top: item.node.position.y,
            }}
          >
            <MapNode node={item.node} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="14" height="14" rx="3"/>
      <path d="M7 3h12a2 2 0 0 1 2 2v12"/>
    </svg>
  )
}
