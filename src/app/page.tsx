// src/app/page.tsx
// Public landing page — logged-out users see marketing, logged-in users redirect.

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-transparent"
        />
        <img
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover opacity-15"
          src="https://images.unsplash.com/photo-1517964603305-11a7aafdd0c1?auto=format&fit=crop&w=1600&q=80"
          alt=""
        />

        <div className="relative px-6 pt-10 pb-16">
          <div className="max-w-6xl mx-auto">
            <nav className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  F
                </div>
                <div>
                  <p className="font-semibold">FitAI</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    AI-powered fitness coach
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hidden sm:inline-flex text-sm px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10
                             hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/login"
                  className="text-sm px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  Get started
                </Link>
              </div>
            </nav>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                  Track workouts.
                  <span className="block text-blue-600 dark:text-blue-400">
                    Get coaching that fits you.
                  </span>
                </h1>
                <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-xl">
                  Log training and chat with an AI coach that understands your history.
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-blue-600 text-white font-medium
                               hover:bg-blue-700 transition-colors"
                  >
                    Start free
                  </Link>
                  <Link
                    href="/workouts/new"
                    className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-gray-200 dark:border-white/10
                               hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-gray-100"
                  >
                    Log a workout
                  </Link>
                </div>

                <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                  <FeatureBadge title="Workout logging" subtitle="Exercises, sets, reps" />
                  <FeatureBadge title="Progress tracking" subtitle="PRs & volume" />
                  <FeatureBadge title="AI coach" subtitle="Plans & form tips" />
                </div>
              </div>

              <div className="relative">
                <div
                  className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-gray-900/40
                              backdrop-blur p-4 shadow-sm"
                >
                  <div className="relative overflow-hidden rounded-2xl">
                    <img
                      className="w-full h-[260px] object-cover"
                      src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
                      alt="Workout motivation"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <div className="absolute left-4 bottom-4 right-4">
                      <p className="text-white/90 text-sm">Today’s session</p>
                      <p className="text-white font-semibold text-lg">
                        Plan, log, and improve
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Consistency</p>
                      <p className="text-2xl font-bold">4x</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">this week</p>
                    </div>
                    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Best set</p>
                      <p className="text-2xl font-bold">95kg</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">bench</p>
                    </div>
                  </div>
                </div>

                <div className="hidden lg:block absolute -right-10 -top-10 w-56 h-56 rounded-full bg-blue-600/10 blur-2xl" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Media section */}
      <section className="px-6 pb-16">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-5">
            <h2 className="text-xl font-semibold">Your AI coach, built on your data</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              Ask questions, generate programs, and get feedback based on real sessions you’ve logged.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <MiniCard title="Personal records" desc="Heaviest weights + reps per exercise." />
              <MiniCard title="Recent workouts" desc="Context from the last sessions you trained." />
              <MiniCard title="Actionable guidance" desc="Specific, practical recommendations." />
              <MiniCard title="Streaming replies" desc="Feels like real-time coaching." />
            </div>
          </div>

          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden">
            <div className="relative">
              <video
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                // Stock video (replace later with your preferred media)
                src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              <div className="absolute left-5 right-5 bottom-5">
                <p className="text-white/90 text-sm">Make training more interactive</p>
                <p className="text-white font-semibold text-lg">Media + coaching in one place</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="px-6 pb-10">
        <div className="max-w-6xl mx-auto rounded-3xl bg-blue-600/10 border border-blue-600/20 p-7 text-center">
          <h2 className="text-2xl font-semibold">Ready to train smarter?</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create an account and start logging today. Your AI coach will learn as you go.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="inline-flex justify-center px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Create account
            </Link>
            <Link
              href="/workouts"
              className="inline-flex justify-center px-6 py-3 rounded-xl bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-white/10
                         hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              View workouts
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureBadge({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 border border-gray-200/60 dark:border-white/10 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{subtitle}</p>
    </div>
  )
}

function MiniCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700 p-4">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{desc}</p>
    </div>
  )
}
