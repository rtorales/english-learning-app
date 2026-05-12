'use client'

import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'

const XP_PER_LEVEL = 500

interface XPBarProps {
  xp: number
  level: number
}

export function XPBar({ xp, level }: XPBarProps) {
  const xpInCurrentLevel = xp % XP_PER_LEVEL
  const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100

  return (
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className="bg-violet-900 text-violet-200">
        Nv. {level}
      </Badge>
      <div className="w-32">
        <Progress value={progress} className="h-2 bg-slate-800" />
      </div>
      <span className="text-xs text-slate-400">{xpInCurrentLevel}/{XP_PER_LEVEL} XP</span>
    </div>
  )
}
