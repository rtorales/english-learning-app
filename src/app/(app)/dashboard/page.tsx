import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { LearningMap } from '@/components/learning-map/LearningMap'
import { XPBar } from '@/components/dashboard/XPBar'
import { StreakCounter } from '@/components/dashboard/StreakCounter'

async function getUserStats(supabaseId: string) {
  const user = await prisma.user.findUnique({
    where: { supabaseId },
    include: {
      progress: { where: { completed: true } },
      srsItems: { where: { due: { lte: new Date() } } },
    },
  })
  return user
}

async function getModulesForUser(cefrLevel: string, sector: string) {
  return prisma.learningModule.findMany({
    where: { sector: sector as never },
    orderBy: { orderIndex: 'asc' },
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await getUserStats(user.id)
  if (!dbUser) redirect('/login')

  if (!dbUser.cefrLevel || !dbUser.sector) {
    redirect('/placement')
  }

  const modules = await getModulesForUser(dbUser.cefrLevel, dbUser.sector)

  return (
    <main className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-violet-400">AprenderIngles</h1>
        <div className="flex items-center gap-4">
          <StreakCounter days={dbUser.streakDays} />
          <XPBar xp={dbUser.xp} level={dbUser.level} />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <Suspense fallback={<div className="text-slate-400">Cargando mapa...</div>}>
          <LearningMap
            modules={modules}
            userLevel={dbUser.cefrLevel}
            completedModuleIds={dbUser.progress.map((p: { moduleId: string }) => p.moduleId)}
            pendingReviews={dbUser.srsItems.length}
          />
        </Suspense>
      </div>
    </main>
  )
}
