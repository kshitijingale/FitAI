// src/types/index.ts
//
// WHY THIS FILE?
// Instead of importing types from Prisma everywhere (which exposes DB internals),
// we define clean "application types" here that components and API routes use.
// This also teaches you one of the most useful TypeScript patterns.

import type { WorkoutSession, WorkoutSet, Exercise, User } from '@prisma/client'

// ─── UTILITY TYPES ────────────────────────────────────────────────────────────

// Pick<T, Keys> = create a new type with only the listed fields
// Omit<T, Keys> = create a new type WITHOUT the listed fields

// ─── USER TYPES ───────────────────────────────────────────────────────────────

// The shape of user data safe to send to the frontend (no password hash)
export type SafeUser = Omit<User, 'password'>

// ─── WORKOUT TYPES ────────────────────────────────────────────────────────────

// A workout set with its exercise info included (nested relation)
export type SetWithExercise = WorkoutSet & {
  exercise: Exercise
}

// A full workout session with all its sets and exercises
export type WorkoutWithSets = WorkoutSession & {
  sets: SetWithExercise[]
}

// What the frontend sends when creating a new workout session
export type CreateWorkoutInput = {
  date?: Date
  notes?: string
  sets: CreateSetInput[]
}

export type CreateSetInput = {
  exerciseId: string
  setNumber: number
  reps: number
  weightKg: number
  rpe?: number
  notes?: string
}

// ─── AI TYPES ─────────────────────────────────────────────────────────────────

export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

// Summary of user's recent data passed to the AI as context
export type UserFitnessContext = {
  goal: string
  fitnessLevel: string
  recentWorkouts: {
    date: string
    exercises: string[]
    totalSets: number
  }[]
  personalRecords: {
    exercise: string
    weightKg: number
    reps: number
  }[]
}

// ─── ANALYTICS TYPES ──────────────────────────────────────────────────────────

// Used by Recharts charts on the dashboard
export type StrengthDataPoint = {
  date: string         // "Jan 15"
  weightKg: number
  reps: number
  volume: number       // weightKg * reps
}

export type VolumeDataPoint = {
  week: string         // "Week 1"
  totalVolume: number  // sum of all (weight * reps) that week
  totalSets: number
}

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

// All API routes return this shape — consistent error handling
export type ApiResponse<T> =
  | { success: true;  data: T }
  | { success: false; error: string }
