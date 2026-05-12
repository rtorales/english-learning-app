import type { CEFRLevel, ProfessionalSector, SRSState } from '@/generated/prisma/enums'

export type { CEFRLevel, ProfessionalSector, SRSState }

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const CEFR_ORDER: Record<CEFRLevel, number> = { A1: 0, A2: 1, B1: 2, B2: 3, C1: 4, C2: 5 }

export const SECTORS: { value: ProfessionalSector; label: string }[] = [
  { value: 'tech', label: 'Ingeniería de Software / IT' },
  { value: 'business', label: 'Gestión y Liderazgo Empresarial' },
  { value: 'data', label: 'Ciencia de Datos / Analytics' },
  { value: 'engineering', label: 'Ingeniería Industrial' },
  { value: 'healthcare', label: 'Ciencias Médicas' },
]

export type SRSRating = 1 | 2 | 3 | 4

export interface FSRSItemState {
  difficulty: number
  stability: number
  retrievability: number
  state: SRSState
  due: Date
  reps: number
  lapses: number
}

export interface CATQuestion {
  id: string
  text: string
  options: string[]
  correctIndex: number
  cefrLevel: CEFRLevel
  difficulty: number
  sector?: ProfessionalSector
}

export interface CATResult {
  estimatedLevel: CEFRLevel
  sector: ProfessionalSector
  correctAnswers: number
  totalQuestions: number
  durationSecs: number
}

export interface MapNode {
  id: string
  title: string
  moduleId: string
  cefrLevel: CEFRLevel
  isCompleted: boolean
  isUnlocked: boolean
  isCheckpoint: boolean
  isBoss: boolean
  xpReward: number
  position: { x: number; y: number }
}

export interface UserStats {
  xp: number
  level: number
  streakDays: number
  cefrLevel: CEFRLevel | null
  sector: ProfessionalSector | null
  pendingReviews: number
  completedModules: number
}

export const XP_PER_ACTION = {
  lesson: 50,
  srsReview: 10,
  streak: 25,
  milestone: 100,
  checkpoint: 75,
  boss: 200,
} as const
