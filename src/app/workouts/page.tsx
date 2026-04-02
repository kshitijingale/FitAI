// src/app/workouts/page.tsx
//
// Shows the full workout history — all sessions, most recent first.
// This is a SERVER component (no 'use client') so it fetches data
// directly from the database without going through the API.
//
// SERVER vs CLIENT components:
// - Server: runs on server, can access DB directly, faster initial load
// - Client: runs in browser, can use useState/useEffect/event handlers
// This page just displays data → server component is perfect.

import { getServerSession } from 'next-auth'
import { redirect }         from 'next/navigation'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/prisma'

export default async function WorkoutsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Fetch ALL workouts with their sets and exercises
  const workouts = await prisma.workoutSession.findMany({
    where:   { userId: session.user.id },
    include: {
      sets: {
        include:  { exercise: true },
        orderBy:  { setNumber: 'asc' },
      },
    },
    orderBy: { date: 'desc' },
  })

  // Helper: group workouts by relative date (Today, This week, Earlier)
  function getDateLabel(date: Date): string {
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7)  return 'This week'
    if (days < 30) return 'This month'
    return new Date(date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
  }

  // Helper: calculate total volume for a session
  function totalVolume(sets: { weightKg: number; reps: number }[]): number {
    return sets.reduce((total, s) => total + s.weightKg * s.reps, 0)
  }

  // Helper: get unique exercises from sets
  function getExercises(sets: { exercise: { name: string } }[]): string[] {
    return [...new Set(sets.map(s => s.exercise.name))]
  }

  // Group workouts by their date label for display
  const grouped = workouts.reduce<Record<string, typeof workouts>>((acc, workout) => {
    const label = getDateLabel(workout.date)
    if (!acc[label]) acc[label] = []
    acc[label].push(workout)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">←</a>
            <div>
              <h1 className="font-semibold text-gray-900 dark:text-gray-100">Workouts</h1>
              <p className="text-xs text-gray-400 dark:text-gray-400">{workouts.length} sessions logged</p>
            </div>
          </div>
          <a
            href="/workouts/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            + Log workout
          </a>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">

        {/* Empty state */}
        {workouts.length === 0 && (
              <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
                <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">No workouts yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-400 mb-6">Log your first session to see it here.</p>
            <a
              href="/workouts/new"
              className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Log first workout
            </a>
          </div>
        )}

        {/* Grouped workout history */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([label, group]) => (
            <section key={label}>
              {/* Date group header */}
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                {label}
              </h2>

              <div className="space-y-3">
                {group.map(workout => {
                  const exercises = getExercises(workout.sets)
                  const volume    = totalVolume(workout.sets)

                  return (
                    <a
                      key={workout.id}
                      href={`/workouts/${workout.id}`}
                      className="block bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all"
                    >
                      {/* Date + duration row */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                            {new Date(workout.date).toLocaleDateString('en-IN', {
                              weekday: 'long',
                              day:     'numeric',
                              month:   'short',
                            })}
                          </p>
                          {workout.duration && (
                            <p className="text-xs text-gray-400">{workout.duration} min</p>
                          )}
                        </div>

                        {/* Volume badge */}
                        {volume > 0 && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full font-medium">
                            {Math.round(volume).toLocaleString()} kg
                          </span>
                        )}
                      </div>

                      {/* Exercise pills */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {exercises.slice(0, 5).map(name => (
                          <span
                            key={name}
                            className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-200 px-2.5 py-1 rounded-full"
                          >
                            {name}
                          </span>
                        ))}
                        {exercises.length > 5 && (
                          <span className="text-xs text-gray-400 px-2 py-1">
                            +{exercises.length - 5} more
                          </span>
                        )}
                      </div>

                      {/* Stats row */}
                      <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-400">
                        <span>{workout.sets.length} sets</span>
                        <span>{exercises.length} exercises</span>
                        {workout.notes && <span>📝 Note</span>}
                      </div>
                    </a>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
