// src/app/dashboard/page.tsx
// Protected dashboard page — redirects to login if not authenticated

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { SignOutButton } from '@/components/layout/SignOutButton'

export default async function DashboardPage() {
  // Server-side auth check — runs on the server before rendering
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/')

  // Fetch stats directly in the server component — no API call needed
  const [totalWorkouts, recentWorkouts] = await Promise.all([
    prisma.workoutSession.count({
      where: { userId: session.user.id },
    }),
    prisma.workoutSession.findMany({
      where: { userId: session.user.id },
      include: { sets: { include: { exercise: true } } },
      orderBy: { date: 'desc' },
      take: 5,
    }),
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">FitAI</h1>
          <nav className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Dashboard</a>
            <a href="/workouts" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">Workouts</a>
            <a href="/ai-coach" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">AI Coach</a>
            <SignOutButton />
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Welcome back, {session.user.name?.split(' ')[0]} 👋
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Let's crush today's workout.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total workouts" value={totalWorkouts.toString()} />
          <StatCard label="This week" value={recentWorkouts.filter(w => {
            const days = (Date.now() - new Date(w.date).getTime()) / 86400000
            return days <= 7
          }).length.toString()} />
          <StatCard label="Total sets" value={
            recentWorkouts.reduce((acc, w) => acc + w.sets.length, 0).toString()
          } suffix="this week" />
        </div>

        {/* Recent workouts */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">Recent workouts</h3>
            <a href="/workouts/new" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium">
              + Log workout
            </a>
          </div>

          {recentWorkouts.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-400">
              <p className="text-4xl mb-2">🏋️</p>
              <p className="text-sm dark:text-gray-300">No workouts yet. Log your first one!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentWorkouts.map(workout => {
                const exercises = [...new Set(workout.sets.map(s => s.exercise.name))]
                return (
                  <div key={workout.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/40 rounded-lg flex items-center justify-center text-lg">💪</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {exercises.slice(0, 3).join(', ')}{exercises.length > 3 ? ` +${exercises.length - 3}` : ''}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-400">
                        {new Date(workout.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' · '}{workout.sets.length} sets
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* AI Coach CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <h3 className="font-semibold text-lg mb-1">Ask your AI coach</h3>
          <p className="text-blue-100 text-sm mb-4">Get a personalised program, macro advice, or just ask about your progress.</p>
          <a
            href="/ai-coach"
            className="inline-block bg-white text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Chat with coach →
          </a>
        </div>
      </main>
    </div>
  )
}

function StatCard({ label, value, suffix }: { label: string; value: string; suffix?: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-400 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
      {suffix && <p className="text-xs text-gray-400 dark:text-gray-400 mt-0.5">{suffix}</p>}
    </div>
  )
}
