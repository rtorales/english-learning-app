'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
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
    })),
    currentDifficulty: z.number(),
    startedAt: z.coerce.date(),
    questions: z.array(z.any()),
  }),
})

export async function submitPlacementTest(input: z.infer<typeof submitSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { sector, session } = submitSchema.parse(input)
  const result = buildCATResult(session as CATSession, sector as ProfessionalSector)

  await prisma.$transaction([
    prisma.placementTest.create({
      data: {
        user: { connect: { supabaseId: user.id } },
        cefrResult: result.estimatedLevel,
        sectorResult: result.sector,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        durationSecs: result.durationSecs,
        answers: session.answers,
      },
    }),
    prisma.user.update({
      where: { supabaseId: user.id },
      data: {
        cefrLevel: result.estimatedLevel,
        sector: result.sector,
      },
    }),
  ])

  redirect('/dashboard')
}
