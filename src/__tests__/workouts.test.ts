// src/__tests__/workouts.test.ts
//
// Unit tests for workout-related logic.
// Run with: npm test
//
// TESTING PHILOSOPHY:
// Don't test the database or Next.js — test YOUR logic.
// Pure functions (input → output, no side effects) are easiest to test.
// Start small: even 5-10 tests shows employers you understand testing.

import { z } from 'zod'

// ─── SCHEMAS UNDER TEST ───────────────────────────────────────────────────────
// We re-define (or import) the validation schemas here to test them in isolation

const createSetSchema = z.object({
  exerciseId: z.string().cuid(),
  setNumber:  z.number().int().min(1),
  reps:       z.number().int().min(1).max(999),
  weightKg:   z.number().min(0).max(9999),
  rpe:        z.number().int().min(1).max(10).optional(),
})

const createWorkoutSchema = z.object({
  notes: z.string().max(500).optional(),
  sets:  z.array(createSetSchema).min(1, 'At least one set is required'),
})

// ─── HELPER FUNCTIONS UNDER TEST ──────────────────────────────────────────────

/** Calculate total volume for a workout session (weight × reps summed) */
function calculateTotalVolume(sets: { weightKg: number; reps: number }[]): number {
  return sets.reduce((total, set) => total + set.weightKg * set.reps, 0)
}

/** Find the personal record (heaviest weight) from a list of sets */
function findPersonalRecord(sets: { weightKg: number; reps: number; date: Date }[]) {
  if (sets.length === 0) return null
  return sets.reduce((best, set) =>
    set.weightKg > best.weightKg ? set : best
  )
}

/** Format workout date for display */
function formatWorkoutDate(date: Date): string {
  const days = Math.floor((Date.now() - date.getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7)  return `${days} days ago`
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

// ─── TESTS ────────────────────────────────────────────────────────────────────

describe('Workout validation schema', () => {
  const validSet = {
    exerciseId: 'clxxxxxxxxxxxxxxxxxxxxxxxx', // valid cuid format
    setNumber:  1,
    reps:       8,
    weightKg:   80,
  }

  test('accepts valid workout data', () => {
    const result = createWorkoutSchema.safeParse({
      notes: 'Good session',
      sets:  [validSet],
    })
    expect(result.success).toBe(true)
  })

  test('rejects empty sets array', () => {
    const result = createWorkoutSchema.safeParse({ sets: [] })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.errors[0].message).toBe('At least one set is required')
    }
  })

  test('rejects negative weight', () => {
    const result = createSetSchema.safeParse({ ...validSet, weightKg: -5 })
    expect(result.success).toBe(false)
  })

  test('rejects zero reps', () => {
    const result = createSetSchema.safeParse({ ...validSet, reps: 0 })
    expect(result.success).toBe(false)
  })

  test('rejects RPE above 10', () => {
    const result = createSetSchema.safeParse({ ...validSet, rpe: 11 })
    expect(result.success).toBe(false)
  })

  test('allows optional RPE', () => {
    const result = createSetSchema.safeParse(validSet) // no rpe field
    expect(result.success).toBe(true)
  })
})

describe('calculateTotalVolume', () => {
  test('returns 0 for empty sets', () => {
    expect(calculateTotalVolume([])).toBe(0)
  })

  test('calculates volume for single set', () => {
    expect(calculateTotalVolume([{ weightKg: 80, reps: 8 }])).toBe(640)
  })

  test('sums volume across multiple sets', () => {
    const sets = [
      { weightKg: 80, reps: 8 },   // 640
      { weightKg: 80, reps: 6 },   // 480
      { weightKg: 75, reps: 8 },   // 600
    ]
    expect(calculateTotalVolume(sets)).toBe(1720)
  })

  test('handles bodyweight exercises (0kg)', () => {
    expect(calculateTotalVolume([{ weightKg: 0, reps: 20 }])).toBe(0)
  })
})

describe('findPersonalRecord', () => {
  const now = new Date()

  test('returns null for empty array', () => {
    expect(findPersonalRecord([])).toBeNull()
  })

  test('finds heaviest set', () => {
    const sets = [
      { weightKg: 80, reps: 8, date: now },
      { weightKg: 100, reps: 3, date: now },  // PR
      { weightKg: 90, reps: 5, date: now },
    ]
    expect(findPersonalRecord(sets)?.weightKg).toBe(100)
  })

  test('returns first set when all equal', () => {
    const sets = [
      { weightKg: 80, reps: 8, date: now },
      { weightKg: 80, reps: 5, date: now },
    ]
    expect(findPersonalRecord(sets)?.weightKg).toBe(80)
  })
})

describe('formatWorkoutDate', () => {
  test('shows "Today" for today', () => {
    expect(formatWorkoutDate(new Date())).toBe('Today')
  })

  test('shows "Yesterday" for yesterday', () => {
    const yesterday = new Date(Date.now() - 86400000)
    expect(formatWorkoutDate(yesterday)).toBe('Yesterday')
  })

  test('shows days ago for recent dates', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000)
    expect(formatWorkoutDate(threeDaysAgo)).toBe('3 days ago')
  })
})
