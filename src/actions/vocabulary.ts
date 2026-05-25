'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

const createCardSchema = z.object({
  front:    z.string().min(1).max(200).trim(),
  back:     z.string().min(1).max(500).trim(),
  context:  z.string().max(500).trim().optional(),
  deckName: z.string().min(1).max(100).trim(),
})

export async function createVocabCard(input: z.infer<typeof createCardSchema>) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const data = createCardSchema.parse(input)

  await prisma.sRSItem.create({
    data: {
      userId:   session.userId,
      front:    data.front,
      back:     data.back,
      context:  data.context ?? null,
      deckName: data.deckName,
      state:    'New',
      due:      new Date(),
    },
  })

  revalidatePath('/vocabulary')
  revalidatePath('/review')
}

export async function deleteVocabCard(cardId: string) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  await prisma.sRSItem.deleteMany({
    where: { id: cardId, userId: session.userId },
  })

  revalidatePath('/vocabulary')
}

// Records a completed study session (called from lesson/SRS completion)
const sessionSchema = z.object({
  type:        z.enum(['lesson', 'srs_review', 'placement']),
  moduleId:    z.string().optional(),
  durationSecs: z.number().int().min(0).optional(),
  totalItems:  z.number().int().min(0),
  correctItems: z.number().int().min(0),
  xpEarned:    z.number().int().min(0),
  results: z.array(z.object({
    srsItemId:    z.string().optional(),
    questionText: z.string(),
    correctAnswer: z.string(),
    userAnswer:   z.string(),
    isCorrect:    z.boolean(),
    timeMs:       z.number().int().optional(),
    cefrLevel:    z.string().optional(),
  })).optional(),
})

export async function recordStudySession(input: z.infer<typeof sessionSchema>) {
  const session = await getSession()
  if (!session) return  // silent — don't break the lesson flow if this fails

  try {
    const data = sessionSchema.parse(input)

    await prisma.studySession.create({
      data: {
        userId:      session.userId,
        type:        data.type,
        moduleId:    data.moduleId ?? null,
        endedAt:     new Date(),
        durationSecs: data.durationSecs ?? null,
        totalItems:  data.totalItems,
        correctItems: data.correctItems,
        xpEarned:    data.xpEarned,
        results: data.results?.length ? {
          create: data.results.map(r => ({
            userId:       session.userId,
            srsItemId:    r.srsItemId ?? null,
            questionText: r.questionText,
            correctAnswer: r.correctAnswer,
            userAnswer:   r.userAnswer,
            isCorrect:    r.isCorrect,
            timeMs:       r.timeMs ?? null,
            cefrLevel:    (r.cefrLevel as any) ?? null,
          })),
        } : undefined,
      },
    })

    revalidatePath('/analytics')
  } catch {
    // non-critical — swallow errors silently
  }
}
