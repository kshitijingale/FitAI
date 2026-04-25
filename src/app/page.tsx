// src/app/page.tsx
// Public landing page — logged-out users see marketing, logged-in users redirect.

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  if (session) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <header className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-transparent to-transparent"
        />
        <img
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-top opacity-15"
          src="https://images.unsplash.com/photo-1549576490-b0b4831ef60a?auto=format&fit=crop&w=1920&q=80"
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
                  className="max-[340px]:text-center max-[340px]:p-1 max-[340px]:leading-none text-sm px-4 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
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
      <section className="px-6 pt-16 pb-16">
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

          <div className="rounded-3xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 overflow-hidden flex">
            {/* Give the media area a real height so the video can fill it */}
            <div className="relative flex-1 min-h-[320px] sm:min-h-[420px] bg-black">
              <video
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                // Stock video (replace later with your preferred media)
                src="https://ik.imagekit.io/cik3lberc/landing-vid.mp4"
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

      {/* CTA */}
      <section className="px-6 pb-10">
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
      </section>


      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* Brand */}
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              FitAI
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Your AI-powered fitness coach. Train smarter, track better, grow faster.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-3">
              Product
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link></li>
              <li><Link href="/workouts" className="hover:text-blue-600">Workouts</Link></li>
              <li><Link href="/ai-coach" className="hover:text-blue-600">AI Coach</Link></li>
              <li><Link href="/progress" className="hover:text-blue-600">Progress</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-3">
              Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-600">Blog</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Help Center</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-blue-600">Terms</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-medium text-slate-900 dark:text-white mb-3">
              Connect
            </h3>

            <div className="flex items-center gap-4">

              {/* GitHub */}
              <Link href="#" className="hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M12 2C6.477 2 2 6.486 2 12.02c0 4.425 2.865 8.18 6.839 9.504.5.09.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.455-1.157-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.004.071 1.532 1.032 1.532 1.032.893 1.532 2.341 1.089 2.91.833.091-.647.35-1.089.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.417-.012 2.744 0 .268.18.577.688.48C19.138 20.195 22 16.444 22 12.02 22 6.486 17.523 2 12 2z" />
                </svg>
              </Link>

              {/* Twitter */}
              <Link href="#" className="hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M22 5.92c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.05 4.28 4.28 0 00-7.3 3.9A12.15 12.15 0 013 4.79a4.28 4.28 0 001.32 5.71 4.23 4.23 0 01-1.94-.54v.05a4.28 4.28 0 003.43 4.2 4.3 4.3 0 01-1.93.07 4.28 4.28 0 004 2.97A8.59 8.59 0 012 19.54a12.12 12.12 0 006.56 1.92c7.87 0 12.17-6.52 12.17-12.17 0-.19-.01-.37-.02-.55A8.72 8.72 0 0022 5.92z" />
                </svg>
              </Link>

              {/* Mail */}
              <Link href="mailto:you@example.com" className="hover:text-green-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M2 5a2 2 0 012-2h16a2 2 0 012 2v.4l-10 6.25L2 5.4V5zm0 2.6l9.4 5.88a1 1 0 001.2 0L22 7.6V19a2 2 0 01-2 2H4a2 2 0 01-2-2V7.6z" />
                </svg>
              </Link>

            </div>

            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
              Built with ❤️ for fitness lovers
            </p>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-slate-200 dark:border-slate-800 text-center py-4 text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} FitAI. All rights reserved.
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
