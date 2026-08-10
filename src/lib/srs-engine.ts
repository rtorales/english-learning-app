import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  State,
  type Card,
  type Grade,
  type RecordLogItem,
} from 'ts-fsrs'
import type { SRSRating } from '@/types'
import type { SRSItem } from '@/generated/prisma/client'

const params = generatorParameters({ enable_fuzz: true, maximum_interval: 365 })
const f = fsrs(params)

export function initNewCard(now?: Date): Card {
  return createEmptyCard(now)
}

export function scheduleReview(
  card: Card,
  rating: SRSRating,
  now: Date = new Date()
): RecordLogItem {
  const grade = rating as Grade
  return f.next(card, now, grade)
}

const STATE_TO_FSRS: Record<string, State> = {
  New: State.New,
  Learning: State.Learning,
  Review: State.Review,
  Relearning: State.Relearning,
}

const FSRS_TO_STATE: Record<number, string> = {
  [State.New]: 'New',
  [State.Learning]: 'Learning',
  [State.Review]: 'Review',
  [State.Relearning]: 'Relearning',
}

export function prismaItemToCard(item: SRSItem): Card {
  return {
    due: item.due,
    stability: item.stability,
    difficulty: item.difficulty,
    elapsed_days: item.lastReviewAt
      ? Math.floor((Date.now() - item.lastReviewAt.getTime()) / 86400000)
      : 0,
    scheduled_days:
      item.nextReviewAt && item.lastReviewAt
        ? Math.floor((item.nextReviewAt.getTime() - item.lastReviewAt.getTime()) / 86400000)
        : 0,
    learning_steps: 0,
    reps: item.reps,
    lapses: item.lapses,
    state: STATE_TO_FSRS[item.state] ?? State.New,
    last_review: item.lastReviewAt ?? undefined,
  }
}

export function cardToStateString(card: Card): string {
  return FSRS_TO_STATE[card.state] ?? 'New'
}

export function getRetentionPercentage(card: Card, now: Date = new Date()): number {
  const r = f.get_retrievability(card, now, false)
  return Math.round((r as number) * 100)
}

export function isDue(item: SRSItem, now: Date = new Date()): boolean {
  return item.due <= now
}

export function getDueSRSItems(items: SRSItem[], now: Date = new Date()): SRSItem[] {
  return items
    .filter((item) => isDue(item, now))
    .sort((a, b) => a.due.getTime() - b.due.getTime())
}
