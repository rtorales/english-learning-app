import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error(
      'DATABASE_URL no está definida. Copiá .env.example a .env y apuntala a tu Postgres ' +
        '(local o el de tu proyecto InsForge: `npx @insforge/cli db connection-string`).'
    )
  }

  // Serverless: cada instancia de la función mantiene su propio pool, así que
  // se deja chico a propósito para no agotar las conexiones del Postgres.
  const adapter = new PrismaPg({
    connectionString,
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
  })

  return new PrismaClient({ adapter })
}

type GlobalPrisma = { prisma?: ReturnType<typeof createPrismaClient> }
const g = globalThis as unknown as GlobalPrisma

export const prisma = g.prisma ?? createPrismaClient()

// En dev, Next recarga los módulos en cada cambio: sin el singleton global
// se abriría un pool nuevo por recarga hasta agotar el límite de Postgres.
if (process.env.NODE_ENV !== 'production') g.prisma = prisma
