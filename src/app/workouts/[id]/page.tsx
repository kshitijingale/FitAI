// src/app/workouts/[id]/page.tsx
//
// Shows the full breakdown of one workout session.
//
// [id] in the folder name = a DYNAMIC ROUTE SEGMENT.
// Next.js passes the actual ID via the params prop.
// e.g. /workouts/clxyz123 → params.id = "clxyz123"

import { getServerSession } from 'next-auth'
import { notFound, redirect } from 'next/navigation'
import { authOptions }  from '@/lib/auth'
import { prisma }       from '@/lib/prisma'

// Next.js passes route params as props to page components
interface WorkoutDetailPageProps {
  params: { id: string }
}

export default async function WorkoutDetailPage({ params }: WorkoutDetailPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  // Fetch the specific workout — notFound() shows a 404 page if it doesn't exist
  const workout = await prisma.workoutSession.findFirst({
    where: {
      id:     params.id,
      userId: session.user.id,   // IMPORTANT: only fetch if it belongs to THIS user
    },
    include: {
      sets: {
        include:  { exercise: true },
        orderBy:  { setNumber: 'asc' },
      },
    },
  })

  if (!workout) notFound()

  // Group sets by exercise for display
  const byExercise = workout.sets.reduce<
    Record<string, { exercise: typeof workout.sets[0]['exercise']; sets: typeof workout.sets }>
  >((acc, set) => {
    const key = set.exerciseId
    if (!acc[key]) acc[key] = { exercise: set.exercise, sets: [] }
    acc[key].sets.push(set)
    return acc
  }, {})

  const totalVolume = workout.sets.reduce((total, s) => total + s.weightKg * s.reps, 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-xl mx-auto flex items-center gap-3">
          <a href="/workouts" className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">← Workouts</a>
          <div>
            <h1 className="font-semibold text-gray-900 dark:text-gray-100">
              {new Date(workout.date).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long'
              })}
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-400">
              {workout.sets.length} sets · {Object.keys(byExercise).length} exercises
              {totalVolume > 0 && ` · ${Math.round(totalVolume).toLocaleString()} kg total`}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6 space-y-4">

        {/* Exercise breakdown */}
        {Object.values(byExercise).map(({ exercise, sets }) => {
          const exerciseVolume = sets.reduce((t, s) => t + s.weightKg * s.reps, 0)
          const bestSet = sets.reduce((best, s) => s.weightKg > best.weightKg ? s : best)

          return (
            <div key={exercise.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              {/* Exercise header */}
              <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{exercise.name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">
                    Best: {bestSet.weightKg}kg × {bestSet.reps} reps
                    {exerciseVolume > 0 && ` · ${Math.round(exerciseVolume).toLocaleString()} kg volume`}
                  </p>
                </div>
              </div>

              {/* Sets table */}
              <div className="px-4 py-3">
                <div className="grid grid-cols-[36px_1fr_1fr_80px] gap-2 mb-2">
                  {['SET', 'KG', 'REPS', 'RPE'].map(h => (
                    <span key={h} className="text-xs font-medium text-gray-400 dark:text-gray-400">{h}</span>
                  ))}
                </div>
                <div className="space-y-2">
                  {sets.map((set, i) => (
                    <div key={set.id} className="grid grid-cols-[36px_1fr_1fr_80px] gap-2 text-sm">
                      <span className="text-gray-400 dark:text-gray-400 text-xs font-semibold">{i + 1}</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{set.weightKg}kg</span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">{set.reps}</span>
                      <span className="text-gray-400 dark:text-gray-400">{set.rpe ?? '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}

        {/* Notes */}
        {workout.notes && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 uppercase tracking-wide mb-2">Notes</p>
            <p className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{workout.notes}</p>
          </div>
        )}

        {/* Ask AI about this workout */}
        <a
          href={`/ai-coach?context=workout-${workout.id}`}
          className="block bg-blue-50 border border-blue-100 rounded-2xl p-4 hover:bg-blue-100 transition-colors"
        >
          <p className="text-sm font-semibold text-blue-700 mb-0.5">Ask your AI coach about this session</p>
          <p className="text-xs text-blue-500">Get feedback, suggestions, and what to focus on next →</p>
        </a>
      </main>
    </div>
  )
}
