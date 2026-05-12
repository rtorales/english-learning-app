'use client'

import { motion } from 'framer-motion'
import { MapNode } from './MapNode'
import type { LearningModule } from '@/generated/prisma/client'
import type { CEFRLevel } from '@/types'
import { CEFR_ORDER } from '@/types'
import Link from 'next/link'

interface LearningMapProps {
  modules: LearningModule[]
  userLevel: CEFRLevel
  completedModuleIds: string[]
  pendingReviews: number
}

export function LearningMap({ modules, userLevel, completedModuleIds, pendingReviews }: LearningMapProps) {
  const userOrder = CEFR_ORDER[userLevel]

  const nodes = modules.map((module, index) => {
    const moduleOrder = CEFR_ORDER[module.cefrLevel as CEFRLevel]
    const isCompleted = completedModuleIds.includes(module.id)
    const isUnlocked = moduleOrder <= userOrder + 1

    const col = index % 3
    const row = Math.floor(index / 3)
    const x = col * 180 + (row % 2 === 1 ? 90 : 0)
    const y = row * 140

    return {
      id: module.id,
      title: module.title,
      moduleId: module.id,
      cefrLevel: module.cefrLevel as CEFRLevel,
      isCompleted,
      isUnlocked,
      isCheckpoint: module.isCheckpoint,
      isBoss: module.isBoss,
      xpReward: module.xpReward,
      position: { x, y },
    }
  })

  const mapHeight = Math.ceil(modules.length / 3) * 140 + 100

  return (
    <div className="relative w-full">
      {pendingReviews > 0 && (
        <Link href="/review">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="mb-6 p-4 bg-violet-900/40 border border-violet-700 rounded-xl flex items-center justify-between cursor-pointer"
          >
            <div>
              <p className="font-semibold text-violet-300">Repasos pendientes</p>
              <p className="text-sm text-slate-400">{pendingReviews} tarjetas listas para revisar</p>
            </div>
            <span className="text-2xl font-bold text-violet-400">{pendingReviews}</span>
          </motion.div>
        </Link>
      )}

      <svg
        className="absolute top-0 left-0 pointer-events-none"
        style={{ width: '100%', height: mapHeight }}
      >
        {nodes.slice(0, -1).map((node, i) => {
          const next = nodes[i + 1]
          if (!next) return null
          return (
            <line
              key={`line-${node.id}`}
              x1={node.position.x + 40}
              y1={node.position.y + 40}
              x2={next.position.x + 40}
              y2={next.position.y + 40}
              stroke={node.isCompleted ? '#7c3aed' : '#334155'}
              strokeWidth={2}
              strokeDasharray={node.isUnlocked ? undefined : '6 4'}
            />
          )
        })}
      </svg>

      <div className="relative" style={{ height: mapHeight }}>
        {nodes.map((node, index) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              position: 'absolute',
              left: node.position.x,
              top: node.position.y,
            }}
          >
            <MapNode node={node} />
          </motion.div>
        ))}
      </div>

      {modules.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <p className="text-lg">El mapa se generará tras completar tu perfil.</p>
        </div>
      )}
    </div>
  )
}
