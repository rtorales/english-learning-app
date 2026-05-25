import path from 'path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@/generated/prisma/client'

// Bump this version string after any `prisma migrate dev` to force singleton recreation.
const SCHEMA_VERSION = 'v4-sessions'

function createPrismaClient() {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').split(path.sep).join('/')
  const adapter = new PrismaLibSql({ url: 'file:' + dbPath })
  return new PrismaClient({ adapter })
}

type GlobalPrisma = { prisma?: ReturnType<typeof createPrismaClient>; prismaVersion?: string }
const g = globalThis as unknown as GlobalPrisma

if (g.prismaVersion !== SCHEMA_VERSION) {
  g.prisma = undefined
  g.prismaVersion = SCHEMA_VERSION
}

export const prisma = g.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') g.prisma = prisma
