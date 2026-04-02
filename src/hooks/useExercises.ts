'use client'
// src/hooks/useExercises.ts
//
// Fetches the exercise library grouped by muscle group.
// Used by the workout form's exercise picker.

import { useState, useEffect } from 'react'
import type { Exercise, MuscleGroup } from '@prisma/client'

// Map of muscle group enum values to display labels
export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  CHEST:      'Chest',
  BACK:       'Back',
  SHOULDERS:  'Shoulders',
  ARMS:       'Arms',
  LEGS:       'Legs',
  GLUTES:     'Glutes',
  CORE:       'Core',
  FULL_BODY:  'Full Body',
  CARDIO:     'Cardio',
}

// Muscle groups in the order we want them displayed
export const MUSCLE_ORDER: MuscleGroup[] = [
  'CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'GLUTES', 'CORE', 'FULL_BODY', 'CARDIO'
]

type UseExercisesReturn = {
  exercises:        Partial<Record<MuscleGroup, Exercise[]>>
  allExercises:     Exercise[]   // flat list — useful for search
  loading:          boolean
  error:            string | null
}

export function useExercises(): UseExercisesReturn {
  const [exercises, setExercises] = useState<Partial<Record<MuscleGroup, Exercise[]>>>({})
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    async function fetch_() {
      try {
        const res  = await fetch('/api/exercises')
        const data = await res.json()
        if (data.success) setExercises(data.data)
        else setError(data.error)
      } catch {
        setError('Failed to load exercises')
      } finally {
        setLoading(false)
      }
    }
    fetch_()
  }, [])

  // Flatten the grouped object into a single array for search
  const allExercises = Object.values(exercises).flat() as Exercise[]

  return { exercises, allExercises, loading, error }
}
