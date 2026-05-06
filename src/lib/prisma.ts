// src/lib/prisma.ts
//
// WHY THIS FILE EXISTS:
// In development, Next.js hot-reloads your code on every save.
// Without this, each reload would create a NEW database connection.
// After a few saves you'd hit PostgreSQL's connection limit.
//
// This file creates ONE Prisma client and reuses it across reloads.
// The `global` trick persists it between hot-reloads in dev.
//
// Prisma can print SQL via either:
// 1) PrismaClient `log: ['query']`, or
// 2) the `debug` package namespaces (commonly `DEBUG=prisma:query` / `prisma:*`)
//
// Your terminal output shows `prisma:query ...`, which is the debug-logger path.
// We remove any `prisma:*` entries from `process.env.DEBUG` before loading `@prisma/client`.
import type { PrismaClient } from '@prisma/client'

const disablePrismaDebugNamespaces = () => {
  const dbg = process.env.DEBUG
  if (!dbg) return

  const parts = dbg
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean)

  const kept = parts.filter((p) => !p.startsWith('prisma:'))

  if (kept.length === 0) {
    delete process.env.DEBUG
  } else {
    process.env.DEBUG = kept.join(',')
  }
}

disablePrismaDebugNamespaces()

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PrismaClient: PrismaClientConstructor } =
  require('@prisma/client') as typeof import('@prisma/client')

// Extend the global type so TypeScript knows about our cached client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClientConstructor({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // ^ In dev, keep output quieter (errors/warnings only).
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// HOW TO USE IN ANY API ROUTE:
// import { prisma } from '@/lib/prisma'
// const workouts = await prisma.workoutSession.findMany({ where: { userId } })
