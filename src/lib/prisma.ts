// src/lib/prisma.ts
//
// WHY THIS FILE EXISTS:
// In development, Next.js hot-reloads your code on every save.
// Without this, each reload would create a NEW database connection.
// After a few saves you'd hit PostgreSQL's connection limit.
//
// This file creates ONE Prisma client and reuses it across reloads.
// The `global` trick persists it between hot-reloads in dev.

import { PrismaClient } from '@prisma/client'

// Extend the global type so TypeScript knows about our cached client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // ^ In dev, this logs every SQL query to your terminal so you can see what's happening
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// HOW TO USE IN ANY API ROUTE:
// import { prisma } from '@/lib/prisma'
// const workouts = await prisma.workoutSession.findMany({ where: { userId } })
