// src/app/workouts/new/ClientNewWorkoutPage.tsx
// Client-side workout logging UI for the protected /workouts/new route.

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExercisePicker } from '@/components/workout/ExercisePicker'
import { SetLogger } from '@/components/workout/SetLogger'
import type { SetFormRow } from '@/components/workout/SetLogger'
import type { Exercise } from '@prisma/client'
import type { CreateWorkoutInput } from '@/types'

// The shape of one exercise block in local state
type ExerciseBlock = {
  id: string // random local ID — just for React keys
  exercise: Exercise
  sets: SetFormRow[]
}

// Default set to show when a new exercise is added
function defaultSet(): SetFormRow {
  return {
    id: crypto.randomUUID(),
    reps: '8',
    weightKg: '0',
    rpe: '',
  }
}

export function ClientNewWorkoutPage() {
  const router = useRouter()

  // The main state — list of exercise blocks the user has added
  const [blocks, setBlocks] = useState<ExerciseBlock[]>([])
  const [notes, setNotes] = useState('')
  const [showPicker, setShowPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Timer state — shows how long the session has been going
  const [startTime] = useState(() => Date.now())
  void startTime // (currently used only for future UI)

  function handleExerciseSelected(exercise: Exercise) {
    const alreadyAdded = blocks.some((b) => b.exercise.id === exercise.id)
    if (alreadyAdded) {
      document.getElementById(`exercise-${exercise.id}`)?.scrollIntoView({ behavior: 'smooth' })
      return
    }

    const newBlock: ExerciseBlock = {
      id: crypto.randomUUID(),
      exercise,
      sets: [defaultSet()],
    }
    setBlocks((prev) => [...prev, newBlock])
  }

  function handleSetsChange(blockId: string, newSets: SetFormRow[]) {
    setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, sets: newSets } : b)))
  }

  function handleRemoveExercise(blockId: string) {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId))
  }

  async function handleSave() {
    setError(null)

    if (blocks.length === 0) {
      setError('Add at least one exercise before saving.')
      return
    }

    const payload: CreateWorkoutInput = {
      notes: notes.trim() || undefined,
      sets: blocks
        .flatMap((block) =>
          block.sets.map((set, setIndex) => ({
            exerciseId: block.exercise.id,
            setNumber: setIndex + 1,
            reps: parseInt(set.reps) || 0,
            weightKg: parseFloat(set.weightKg) || 0,
            rpe: set.rpe ? parseInt(set.rpe) : undefined,
          }))
        )
        .filter((s) => s.reps > 0),
    }

    if (payload.sets.length === 0) {
      setError('Please fill in reps for at least one set.')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        router.push('/workouts')
        router.refresh()
      } else {
        setError(data.error ?? 'Failed to save workout')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const totalSets = blocks.reduce((n, b) => n + b.sets.length, 0)
  const totalVolume = blocks.reduce(
    (total, block) =>
      total +
      block.sets.reduce((bTotal, s) => {
        return bTotal + (parseFloat(s.weightKg) || 0) * (parseInt(s.reps) || 0)
      }, 0),
    0
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Back"
              className="shrink-0 w-10 h-10 inline-flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              ←
            </button>

            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">New workout</p>
              <p className="text-xs text-gray-400 dark:text-gray-400 truncate">
                {blocks.length > 0
                  ? `${blocks.length} exercise${blocks.length > 1 ? 's' : ''} · ${totalSets} sets${
                      totalVolume > 0 ? ` · ${Math.round(totalVolume).toLocaleString()} kg` : ''
                    }`
                  : 'Add exercises below'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || blocks.length === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save workout'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 dark:border-red-900 border border-red-200 text-red-700 dark:text-red-200 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {blocks.length > 0 && (
          <div className="flex items-center gap-2 px-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Exercises</p>
          </div>
        )}

        {blocks.map((block) => (
          <div key={block.id} id={`exercise-${block.exercise.id}`}>
            <SetLogger
              exercise={block.exercise}
              sets={block.sets}
              onChange={(newSets) => handleSetsChange(block.id, newSets)}
              onRemoveExercise={() => handleRemoveExercise(block.id)}
            />
          </div>
        ))}

        {blocks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🏋️</div>
            <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">Ready to train?</p>
            <p className="text-sm text-gray-400 dark:text-gray-400 mb-6">Add your first exercise to get started.</p>
          </div>
        )}

        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className="w-full py-3.5 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-medium text-gray-400 dark:text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all"
        >
          + Add exercise
        </button>

        {blocks.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
              Session notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the session feel? Any PRs? Injuries to note?"
              rows={3}
              maxLength={500}
              className="w-full text-sm text-gray-700 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-500 resize-none focus:outline-none bg-transparent"
            />
            <p className="text-right text-xs text-gray-300 dark:text-gray-500 mt-1">{notes.length}/500</p>
          </div>
        )}

        {blocks.length === 0 && (
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Tips</p>
            <ul className="text-sm text-blue-700 dark:text-blue-200 space-y-1">
              <li>• RPE is optional — rate effort from 1 (easy) to 10 (max)</li>
              <li>• Weight defaults copy from your previous set</li>
              <li>• Your AI coach can see this session immediately after saving</li>
            </ul>
          </div>
        )}

        <div className="h-8" />
      </main>

      {showPicker && (
        <ExercisePicker onSelect={handleExerciseSelected} onClose={() => setShowPicker(false)} />
      )}
    </div>
  )
}

