import path from 'path'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { PrismaClient } from '@/generated/prisma/client'

function createPrismaClient() {
  const dbPath = path.resolve(process.cwd(), 'prisma', 'dev.db').split(path.sep).join('/')
  const adapter = new PrismaLibSql({ url: 'file:' + dbPath })
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: ReturnType<typeof createPrismaClient> }

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
