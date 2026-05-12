'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { MapNode as MapNodeType } from '@/types'

interface MapNodeProps {
  node: MapNodeType
}

export function MapNode({ node }: MapNodeProps) {
  const icon = node.isBoss ? '👑' : node.isCheckpoint ? '🏁' : '📚'

  const baseClasses = 'w-20 h-20 rounded-full flex flex-col items-center justify-center border-2 transition-all'

  const stateClasses = node.isCompleted
    ? 'bg-violet-700 border-violet-400 shadow-lg shadow-violet-900/50'
    : node.isUnlocked
    ? 'bg-slate-800 border-violet-600 hover:border-violet-400 cursor-pointer'
    : 'bg-slate-900 border-slate-700 opacity-50 cursor-not-allowed'

  const content = (
    <motion.div
      whileHover={node.isUnlocked ? { scale: 1.1 } : undefined}
      whileTap={node.isUnlocked ? { scale: 0.95 } : undefined}
      className={cn(baseClasses, stateClasses)}
      title={node.isUnlocked ? node.title : `Requiere nivel ${node.cefrLevel}`}
    >
      <span className="text-2xl">{node.isUnlocked ? icon : '🔒'}</span>
      <span className="text-[10px] text-slate-300 mt-1 text-center px-1 leading-tight line-clamp-2">
        {node.cefrLevel}
      </span>
    </motion.div>
  )

  if (!node.isUnlocked) return content

  return (
    <Link href={`/learn/${node.moduleId}`} className="block">
      {content}
      <p className="text-xs text-slate-400 text-center mt-1 w-20 truncate">{node.title}</p>
    </Link>
  )
}
