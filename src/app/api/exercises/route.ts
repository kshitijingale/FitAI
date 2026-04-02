// src/app/api/exercises/route.ts
//
// GET /api/exercises
// GET /api/exercises?muscle=CHEST
//
// Returns the exercise library. The workout form uses this
// to populate the exercise picker dropdown.

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'
import type { Exercise, MuscleGroup } from '@prisma/client'

// The response shape: exercises grouped by muscle group
// e.g. { CHEST: [...], BACK: [...], LEGS: [...] }
export type ExercisesByMuscle = Record<MuscleGroup, Exercise[]>

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const { searchParams } = new URL(request.url)
  const muscle = searchParams.get('muscle') as MuscleGroup | null

  const exercises = await prisma.exercise.findMany({
    where:   muscle ? { muscleGroup: muscle } : undefined,
    orderBy: { name: 'asc' },
  })

  // GROUP BY muscle — transforms flat array into { CHEST: [...], BACK: [...] }
  // This is a common TypeScript pattern: reduce() to build an object
  const grouped = exercises.reduce<Partial<ExercisesByMuscle>>((acc, exercise) => {
    const key = exercise.muscleGroup
    if (!acc[key]) acc[key] = []
    acc[key]!.push(exercise)
    return acc
  }, {})

  return NextResponse.json<ApiResponse<Partial<ExercisesByMuscle>>>({
    success: true,
    data: grouped,
  })
}
