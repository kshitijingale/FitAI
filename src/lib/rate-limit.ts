// Sliding-window limiter. In-memory stops bursts on one instance;
// the daily user cap uses Prisma so it still applies across Vercel isolates.

import { prisma } from '@/lib/prisma'

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; message: string }

const hits = new Map<string, number[]>()

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const DAY_MS = 24 * HOUR_MS

// Enough for a real coaching session; tight enough to cap credit burn.
const USER_PER_MINUTE = 8
const USER_PER_HOUR = 30
const USER_PER_DAY = 80
const IP_PER_MINUTE = 12
const REGISTER_PER_HOUR = 5

function prune(key: string, windowMs: number, now: number): number[] {
  const kept = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
  if (kept.length === 0) hits.delete(key)
  else hits.set(key, kept)
  return kept
}

function take(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const timestamps = prune(key, windowMs, now)

  if (hits.size > 4_000) {
    for (const [k, ts] of hits) {
      const fresh = ts.filter((t) => now - t < DAY_MS)
      if (fresh.length === 0) hits.delete(k)
      else hits.set(k, fresh)
    }
  }

  if (timestamps.length >= limit) {
    const retryAfterSec = Math.max(
      1,
      Math.ceil((windowMs - (now - timestamps[0])) / 1000)
    )
    return {
      ok: false,
      retryAfterSec,
      message: `Too many requests. Try again in ${retryAfterLabel(retryAfterSec)}.`,
    }
  }

  timestamps.push(now)
  hits.set(key, timestamps)
  return { ok: true }
}

function retryAfterLabel(sec: number): string {
  if (sec < 60) return `${sec} second${sec === 1 ? '' : 's'}`
  const min = Math.ceil(sec / 60)
  return `${min} minute${min === 1 ? '' : 's'}`
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function checkAiChatRateLimit(
  userId: string,
  ip: string
): Promise<RateLimitResult> {
  const minute = take(`ai:user:${userId}:m`, USER_PER_MINUTE, MINUTE_MS)
  if (!minute.ok) {
    return {
      ...minute,
      message: `Too many AI requests. Slow down — you can send ${USER_PER_MINUTE} messages per minute.`,
    }
  }

  const ipMinute = take(`ai:ip:${ip}:m`, IP_PER_MINUTE, MINUTE_MS)
  if (!ipMinute.ok) {
    return {
      ...ipMinute,
      message: `Too many AI requests from this network. Try again in ${retryAfterLabel(ipMinute.retryAfterSec)}.`,
    }
  }

  const sinceHour = new Date(Date.now() - HOUR_MS)
  const sinceDay = new Date(Date.now() - DAY_MS)

  // Sequential to avoid prepared-statement issues on pooled serverless connections
  const hourCount = await prisma.aiMessage.count({
    where: {
      role: 'user',
      createdAt: { gte: sinceHour },
      conversation: { userId },
    },
  })
  const dayCount = await prisma.aiMessage.count({
    where: {
      role: 'user',
      createdAt: { gte: sinceDay },
      conversation: { userId },
    },
  })

  if (hourCount >= USER_PER_HOUR) {
    return {
      ok: false,
      retryAfterSec: 15 * 60,
      message: `Hourly AI limit reached (${USER_PER_HOUR} messages). Try again later.`,
    }
  }

  if (dayCount >= USER_PER_DAY) {
    return {
      ok: false,
      retryAfterSec: 60 * 60,
      message: `Daily AI limit reached (${USER_PER_DAY} messages). Come back tomorrow.`,
    }
  }

  return { ok: true }
}

export function checkRegisterRateLimit(ip: string): RateLimitResult {
  const result = take(`reg:ip:${ip}:h`, REGISTER_PER_HOUR, HOUR_MS)
  if (!result.ok) {
    return {
      ...result,
      message: 'Too many sign-ups from this network. Try again later.',
    }
  }
  return result
}

export function rateLimitResponse(result: Extract<RateLimitResult, { ok: false }>): Response {
  return new Response(result.message, {
    status: 429,
    headers: {
      'Retry-After': String(result.retryAfterSec),
      'Content-Type': 'text/plain; charset=utf-8',
    },
  })
}
