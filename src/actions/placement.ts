'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { buildCATResult } from '@/lib/cat-engine'
import type { CATSession } from '@/lib/cat-engine'
import type { ProfessionalSector } from '@/types'

const submitSchema = z.object({
  sector: z.enum(['tech', 'business', 'data', 'engineering', 'healthcare']),
  session: z.object({
    answers: z.array(z.object({
      questionId: z.string(),
      selectedIndex: z.number(),
      correct: z.boolean(),
      timeMs: z.number(),
      difficulty: z.number(),
    })),
    currentDifficulty: z.number(),
    startedAt: z.coerce.date(),
    questions: z.array(z.any()),
  }),
})

export async function submitPlacementTest(input: z.infer<typeof submitSchema>) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const { sector, session: catSession } = submitSchema.parse(input)
  const result = buildCATResult(catSession as CATSession, sector as ProfessionalSector)

  await prisma.$transaction([
    prisma.placementTest.create({
      data: {
        userId: session.userId,
        cefrResult: result.estimatedLevel,
        sectorResult: result.sector,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        durationSecs: result.durationSecs,
        answers: JSON.stringify(catSession.answers),
      },
    }),
    prisma.user.update({
      where: { id: session.userId },
      data: {
        cefrLevel: result.estimatedLevel,
        sector: result.sector,
      },
    }),
  ])

  redirect('/dashboard')
}
