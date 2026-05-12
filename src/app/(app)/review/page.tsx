import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { SRSReviewSession } from '@/components/review/SRSReviewSession'
import { getDueSRSItems } from '@/lib/srs-engine'

export default async function ReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({ where: { supabaseId: user.id } })
  if (!dbUser) redirect('/login')

  const allItems = await prisma.sRSItem.findMany({
    where: { userId: dbUser.id },
  })

  const dueItems = getDueSRSItems(allItems)

  if (dueItems.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-violet-400 mb-2">¡Todo al día!</h1>
          <p className="text-slate-400">No hay tarjetas pendientes de revisión hoy.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <SRSReviewSession items={dueItems} />
    </main>
  )
}
