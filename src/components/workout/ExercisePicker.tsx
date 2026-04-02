'use client'
// src/components/workout/ExercisePicker.tsx
//
// A modal that lets the user search and select an exercise.
// Appears when they click "+ Add exercise" in the workout form.
//
// KEY CONCEPTS IN THIS FILE:
// - Controlled search input with live filtering
// - Passing data UP to parent via onSelect callback prop
// - TypeScript: typing component props with an interface

import { useState, useMemo } from 'react'
import type { Exercise } from '@prisma/client'
import { useExercises, MUSCLE_LABELS, MUSCLE_ORDER } from '@/hooks/useExercises'

// Props interface — defines what the parent MUST pass to this component
interface ExercisePickerProps {
  onSelect: (exercise: Exercise) => void   // called when user picks an exercise
  onClose:  () => void                     // called when user dismisses the modal
}

export function ExercisePicker({ onSelect, onClose }: ExercisePickerProps) {
  const { exercises, allExercises, loading } = useExercises()
  const [search,         setSearch]         = useState('')
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null)

  // useMemo: only re-compute filtered list when search or exercises change
  // Without this, it would recompute on EVERY render (e.g. every keystroke)
  const filteredExercises = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (query) {
      // Search mode: filter across ALL exercises regardless of muscle group
      return allExercises.filter(e => e.name.toLowerCase().includes(query))
    }

    if (selectedMuscle) {
      // Muscle filter mode
      return exercises[selectedMuscle as keyof typeof exercises] ?? []
    }

    // Default: show all exercises flat
    return allExercises
  }, [search, selectedMuscle, exercises, allExercises])

  function handleSelect(exercise: Exercise) {
    onSelect(exercise)   // pass selected exercise up to the parent form
    onClose()
  }

  return (
    // Backdrop — clicking it closes the modal
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal panel — stop click propagation so clicking inside doesn't close it */}
      <div
        className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Choose exercise</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        {/* Search input */}
        <div className="px-4 py-3 border-b border-gray-100">
          <input
            autoFocus
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => { setSearch(e.target.value); setSelectedMuscle(null) }}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Muscle group filter pills — hidden when searching */}
        {!search && (
          <div className="px-4 py-2 border-b border-gray-100 flex gap-2 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setSelectedMuscle(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                !selectedMuscle
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {MUSCLE_ORDER.map(muscle => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedMuscle === muscle
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {MUSCLE_LABELS[muscle]}
              </button>
            ))}
          </div>
        )}

        {/* Exercise list */}
        <div className="overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              Loading exercises...
            </div>
          ) : filteredExercises.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-gray-400 text-sm">
              No exercises found
            </div>
          ) : (
            // Group by muscle when not searching
            search ? (
              <ul>
                {filteredExercises.map(exercise => (
                  <ExerciseRow key={exercise.id} exercise={exercise} onSelect={handleSelect} />
                ))}
              </ul>
            ) : (
              // Show grouped by muscle
              MUSCLE_ORDER.map(muscle => {
                const list = selectedMuscle
                  ? (selectedMuscle === muscle ? filteredExercises : [])
                  : (exercises[muscle] ?? [])
                if (list.length === 0) return null
                return (
                  <div key={muscle}>
                    <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                      {MUSCLE_LABELS[muscle]}
                    </div>
                    <ul>
                      {list.map(exercise => (
                        <ExerciseRow key={exercise.id} exercise={exercise} onSelect={handleSelect} />
                      ))}
                    </ul>
                  </div>
                )
              })
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Small sub-component for each row in the list
function ExerciseRow({ exercise, onSelect }: { exercise: Exercise; onSelect: (e: Exercise) => void }) {
  return (
    <li>
      <button
        onClick={() => onSelect(exercise)}
        className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between group transition-colors"
      >
        <span className="text-sm font-medium text-gray-800">{exercise.name}</span>
        <span className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
          {exercise.equipment.replace('_', ' ')}
        </span>
      </button>
    </li>
  )
}
