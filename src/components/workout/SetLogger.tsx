'use client'
// src/components/workout/SetLogger.tsx
//
// Renders one exercise block in the workout form.
// Shows the exercise name + all its sets (reps, weight inputs).
// The user can add/remove sets and type their reps/weight.
//
// KEY CONCEPTS:
// - Local state for set data
// - Lifting state up: parent owns the data, child calls onChange
// - Array manipulation: adding/removing items immutably

import type { Exercise } from '@prisma/client'
import type { CreateSetInput } from '@/types'

// The data shape for a single set row in the form
// Partial because the user fills in fields progressively
export type SetFormRow = {
  id:       string   // local-only ID for React keys (not the DB id)
  reps:     string   // string so the input can be empty while typing
  weightKg: string
  rpe:      string
}

interface SetLoggerProps {
  exercise:       Exercise
  sets:           SetFormRow[]
  onChange:       (sets: SetFormRow[]) => void   // tells parent when sets change
  onRemoveExercise: () => void
}

export function SetLogger({ exercise, sets, onChange, onRemoveExercise }: SetLoggerProps) {

  function addSet() {
    // Copy the last set's values as defaults for the new set (common UX pattern)
    const last = sets[sets.length - 1]
    const newSet: SetFormRow = {
      id:       crypto.randomUUID(),
      reps:     last?.reps     ?? '8',
      weightKg: last?.weightKg ?? '0',
      rpe:      '',
    }
    onChange([...sets, newSet])
  }

  function removeSet(id: string) {
    onChange(sets.filter(s => s.id !== id))
  }

  // Update a single field in a single set
  // This pattern (map + spread) is how you update one item in an array immutably
  function updateSet(id: string, field: keyof SetFormRow, value: string) {
    onChange(
      sets.map(s => s.id === id ? { ...s, [field]: value } : s)
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Exercise header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div>
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{exercise.name}</p>
          <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
            {exercise.muscleGroup.charAt(0) + exercise.muscleGroup.slice(1).toLowerCase()}
            {' · '}{exercise.equipment.replace('_', ' ')}
          </p>
        </div>
        <button
          onClick={onRemoveExercise}
          className="text-gray-300 dark:text-gray-300 hover:text-red-400 transition-colors text-lg leading-none px-1"
          title="Remove exercise"
        >
          ×
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[36px_1fr_1fr_80px_32px] gap-2 px-4 pt-3 pb-1">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-400">SET</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-400">KG</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-400">REPS</span>
        <span className="text-xs font-medium text-gray-400 dark:text-gray-400">RPE</span>
        <span />
      </div>

      {/* Set rows */}
      <div className="px-4 pb-2 space-y-2">
        {sets.map((set, index) => (
          <div key={set.id} className="grid grid-cols-[36px_1fr_1fr_80px_32px] gap-2 items-center">
            {/* Set number badge */}
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-400 text-center">
              {index + 1}
            </span>

            {/* Weight input */}
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={set.weightKg}
              onChange={e => updateSet(set.id, 'weightKg', e.target.value)}
              placeholder="0"
              className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100"
            />

            {/* Reps input */}
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="999"
              value={set.reps}
              onChange={e => updateSet(set.id, 'reps', e.target.value)}
              placeholder="8"
              className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100"
            />

            {/* RPE input (optional) */}
            <input
              type="number"
              inputMode="numeric"
              min="1"
              max="10"
              value={set.rpe}
              onChange={e => updateSet(set.id, 'rpe', e.target.value)}
              placeholder="—"
              className="w-full px-2 py-2 border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-400 dark:text-gray-300"
            />

            {/* Remove set button */}
            <button
              onClick={() => removeSet(set.id)}
              disabled={sets.length === 1}  // can't remove the last set
              className="text-gray-200 dark:text-gray-100 hover:text-red-400 disabled:opacity-0 disabled:cursor-not-allowed transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add set + volume total row */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
        <button
          onClick={addSet}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          + Add set
        </button>

        {/* Live volume calculation — shows total volume for this exercise */}
        <span className="text-xs text-gray-400 dark:text-gray-400">
          {(() => {
            const volume = sets.reduce((total, s) => {
              const w = parseFloat(s.weightKg) || 0
              const r = parseInt(s.reps)       || 0
              return total + w * r
            }, 0)
            return volume > 0 ? `${volume.toLocaleString()} kg total volume` : ''
          })()}
        </span>
      </div>
    </div>
  )
}
