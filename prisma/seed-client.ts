/**
 * Cliente Prisma compartido por los scripts de seed.
 * Corren fuera de Next, así que cargan el .env por su cuenta.
 */
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'

try {
  process.loadEnvFile('.env')
} catch {
  // sin .env: se usan las variables que ya estén en el entorno
}

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error('✖ DATABASE_URL no está definida. Copiá .env.example a .env antes de correr el seed.')
  process.exit(1)
}

export const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })
