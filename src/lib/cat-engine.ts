import type { CATQuestion, CATResult, CEFRLevel, ProfessionalSector } from '@/types'
import { CEFR_LEVELS, CEFR_ORDER } from '@/types'

const MAX_QUESTIONS = 20
const CONVERGENCE_THRESHOLD = 0.5

export interface CATSession {
  questions: CATQuestion[]
  answers: { questionId: string; selectedIndex: number; correct: boolean; timeMs: number }[]
  currentDifficulty: number
  startedAt: Date
}

export function createCATSession(): CATSession {
  return {
    questions: [],
    answers: [],
    currentDifficulty: 5,
    startedAt: new Date(),
  }
}

export function selectNextDifficulty(session: CATSession): number {
  const { answers } = session
  if (answers.length === 0) return 5

  const lastCorrect = answers[answers.length - 1].correct
  const current = session.currentDifficulty

  if (lastCorrect) {
    return Math.min(10, current + (10 - current) * 0.4)
  } else {
    return Math.max(1, current - current * 0.4)
  }
}

export function estimateCEFRLevel(session: CATSession): CEFRLevel {
  const { answers } = session
  if (answers.length === 0) return 'A1'

  const correctRatio = answers.filter((a) => a.correct).length / answers.length
  const avgDifficulty = answers.reduce((sum, _, i) => {
    return sum + session.currentDifficulty
  }, 0) / answers.length

  const score = (avgDifficulty / 10) * 0.6 + correctRatio * 0.4
  const levelIndex = Math.min(5, Math.floor(score * 6))
  return CEFR_LEVELS[levelIndex]
}

export function shouldTerminate(session: CATSession): boolean {
  return session.answers.length >= MAX_QUESTIONS
}

export function buildCATResult(
  session: CATSession,
  sector: ProfessionalSector
): CATResult {
  const durationSecs = Math.floor((Date.now() - session.startedAt.getTime()) / 1000)
  return {
    estimatedLevel: estimateCEFRLevel(session),
    sector,
    correctAnswers: session.answers.filter((a) => a.correct).length,
    totalQuestions: session.answers.length,
    durationSecs,
  }
}

export function filterModulesByCEFR(
  allModules: { cefrLevel: CEFRLevel; id: string }[],
  userLevel: CEFRLevel
): string[] {
  const userOrder = CEFR_ORDER[userLevel]
  return allModules
    .filter((m) => CEFR_ORDER[m.cefrLevel] >= userOrder)
    .map((m) => m.id)
}
