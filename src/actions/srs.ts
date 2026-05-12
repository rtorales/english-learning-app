'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { cardToStateString, prismaItemToCard, scheduleReview } from '@/lib/srs-engine'
import { XP_PER_ACTION } from '@/types'

const reviewSchema = z.object({
  srsItemId: z.string().cuid(),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
})

export async function submitSRSReview(input: z.infer<typeof reviewSchema>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { srsItemId, rating } = reviewSchema.parse(input)

  const item = await prisma.sRSItem.findUnique({ where: { id: srsItemId } })
  if (!item || item.userId !== user.id) throw new Error('Item not found')

  const card = prismaItemToCard(item)
  const result = scheduleReview(card, rating)
  const { card: updatedCard } = result

  const now = new Date()

  await prisma.$transaction([
    prisma.sRSItem.update({
      where: { id: srsItemId },
      data: {
        state: cardToStateString(updatedCard) as 'New' | 'Learning' | 'Review' | 'Relearning',
        difficulty: updatedCard.difficulty,
        stability: updatedCard.stability,
        due: updatedCard.due,
        lastReviewAt: now,
        nextReviewAt: updatedCard.due,
        reps: updatedCard.reps,
        lapses: updatedCard.lapses,
      },
    }),
    prisma.user.update({
      where: { supabaseId: user.id },
      data: {
        xp: { increment: XP_PER_ACTION.srsReview },
        lastActivityAt: now,
      },
    }),
  ])

  revalidatePath('/review')
}
