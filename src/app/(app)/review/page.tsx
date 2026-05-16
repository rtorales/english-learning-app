import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SRSReviewSession } from '@/components/review/SRSReviewSession'
import { getDueSRSItems } from '@/lib/srs-engine'

export default async function ReviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const allItems = await prisma.sRSItem.findMany({ where: { userId: session.userId } })
  const dueItems = getDueSRSItems(allItems)

  if (dueItems.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: 24 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>¡Todo al día!</h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 24 }}>No hay tarjetas pendientes de revisión hoy.</p>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '0 20px', height: 48, borderRadius: 14,
            background: 'var(--primary)', color: 'var(--primary-ink)',
            fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14,
            textDecoration: 'none', boxShadow: '0 4px 0 var(--primary-2)',
            textTransform: 'uppercase', letterSpacing: '-0.01em',
          }}>
            ← Volver al mapa
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
      <SRSReviewSession items={dueItems} />
    </div>
  )
}
