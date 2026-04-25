'use client'
// src/hooks/useWorkouts.ts
//
// A custom React hook that fetches the user's workouts.
//
// WHY CUSTOM HOOKS?
// Instead of writing fetch() logic in every component that needs workouts,
// we encapsulate it here. Any component can just call useWorkouts()
// and get { workouts, loading, error, refetch } back.
//
// This is one of the most important patterns in modern React.

import { useState, useEffect, useCallback } from 'react'
import type { WorkoutWithSets } from '@/types'

type UseWorkoutsReturn = {
  workouts: WorkoutWithSets[]
  loading:  boolean
  error:    string | null
  refetch:  () => Promise<void>
}

export function useWorkouts(): UseWorkoutsReturn {
  const [workouts, setWorkouts] = useState<WorkoutWithSets[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  const fetchWorkouts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const res  = await fetch('/api/workouts')
      const data = await res.json()

      if (!data.success) {
        setError(data.error)
      } else {
        setWorkouts(data.data)
      }
    } catch {
      setError('Failed to load workouts')
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchWorkouts()
  }, [fetchWorkouts])

  return { workouts, loading, error, refetch: fetchWorkouts }
}
