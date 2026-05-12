'use client'

import { Badge } from '@/components/ui/badge'

interface StreakCounterProps {
  days: number
}

export function StreakCounter({ days }: StreakCounterProps) {
  return (
    <Badge variant="secondary" className="bg-orange-900 text-orange-200 gap-1">
      <span>🔥</span>
      <span>{days}</span>
    </Badge>
  )
}
