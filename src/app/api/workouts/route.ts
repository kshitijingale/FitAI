// src/app/api/workouts/route.ts
//
// GET  /api/workouts  — fetch all workouts for the logged-in user
// POST /api/workouts  — log a new workout session

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { z } from 'zod'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, WorkoutWithSets } from '@/types'

// Validation schema for creating a workout
const createWorkoutSchema = z.object({
  date:  z.string().datetime().optional(),
  notes: z.string().max(500).optional(),
  sets:  z.array(z.object({
    exerciseId: z.string().cuid('Invalid exercise ID'),
    setNumber:  z.number().int().min(1),
    reps:       z.number().int().min(1).max(999),
    weightKg:   z.number().min(0).max(9999),
    rpe:        z.number().int().min(1).max(10).optional(),
    notes:      z.string().max(200).optional(),
  })).min(1, 'At least one set is required'),
})

// ─── GET: Fetch all workouts for the logged-in user ───────────────────────────
export async function GET(request: Request) {
  // 1. Get the current user's session
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  // 2. Parse optional query params for filtering
  const { searchParams } = new URL(request.url)
  const limit  = parseInt(searchParams.get('limit') ?? '20')
  const offset = parseInt(searchParams.get('offset') ?? '0')

  // 3. Fetch workouts from database
  // "include" = JOIN — tells Prisma to fetch related sets and their exercises
  const workouts = await prisma.workoutSession.findMany({
    where:   { userId: session.user.id },
    include: {
      sets: {
        include: { exercise: true },
        orderBy: { setNumber: 'asc' },
      },
    },
    orderBy: { date: 'desc' },
    take:    limit,
    skip:    offset,
  })

  return NextResponse.json<ApiResponse<WorkoutWithSets[]>>({
    success: true,
    data: workouts,
  })
}

// ─── POST: Log a new workout ───────────────────────────────────────────────────
export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  try {
    const body = await request.json()
    const result = createWorkoutSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { date, notes, sets } = result.data

    // Create the workout session AND all its sets in one atomic transaction
    // If any part fails, the whole thing is rolled back — no partial data
    const workout = await prisma.workoutSession.create({
      data: {
        userId: session.user.id,
        date:   date ? new Date(date) : new Date(),
        notes,
        sets: {
          create: sets.map(set => ({
            exerciseId: set.exerciseId,
            setNumber:  set.setNumber,
            reps:       set.reps,
            weightKg:   set.weightKg,
            rpe:        set.rpe,
            notes:      set.notes,
          })),
        },
      },
      include: {
        sets: { include: { exercise: true } },
      },
    })

    return NextResponse.json<ApiResponse<WorkoutWithSets>>(
      { success: true, data: workout },
      { status: 201 }
    )
  } catch (error) {
    console.error('[CREATE WORKOUT ERROR]', error)
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Failed to save workout' },
      { status: 500 }
    )
  }
}
