import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://neondb_owner:npg_2uZgj3rnMtIz@ep-super-mode-b1xpee2z-pooler.c-5.eu-central-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true',
      },
    },
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
