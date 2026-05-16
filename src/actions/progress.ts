'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { XP_PER_ACTION } from '@/types'

const completeModuleSchema = z.object({
  moduleId: z.string().cuid(),
  score: z.number().min(0).max(100),
})

export async function completeModule(input: z.infer<typeof completeModuleSchema>) {
  const session = await getSession()
  if (!session) throw new Error('Unauthorized')

  const { moduleId, score } = completeModuleSchema.parse(input)

  const [dbUser, module] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.userId } }),
    prisma.learningModule.findUnique({ where: { id: moduleId } }),
  ])
  if (!dbUser) throw new Error('User not found')
  if (!module) throw new Error('Module not found')

  const xpEarned = module.isBoss
    ? XP_PER_ACTION.boss
    : module.isCheckpoint
    ? XP_PER_ACTION.checkpoint
    : XP_PER_ACTION.lesson

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const lastActivity = dbUser.lastActivityAt
    ? new Date(dbUser.lastActivityAt.getFullYear(), dbUser.lastActivityAt.getMonth(), dbUser.lastActivityAt.getDate())
    : null
  const isNewDay = !lastActivity || lastActivity.getTime() < today.getTime()

  await prisma.$transaction([
    prisma.userProgress.upsert({
      where: { userId_moduleId: { userId: dbUser.id, moduleId } },
      create: { userId: dbUser.id, moduleId, completed: true, score, xpEarned, attempts: 1, completedAt: now },
      update: { completed: true, score, xpEarned, attempts: { increment: 1 }, completedAt: now },
    }),
    prisma.user.update({
      where: { id: dbUser.id },
      data: {
        xp: { increment: xpEarned + (isNewDay ? XP_PER_ACTION.streak : 0) },
        streakDays: { increment: isNewDay ? 1 : 0 },
        lastActivityAt: now,
      },
    }),
  ])

  revalidatePath('/dashboard')
  revalidatePath(`/learn/${moduleId}`)
}
