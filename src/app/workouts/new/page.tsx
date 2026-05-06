// src/app/workouts/new/page.tsx
// Server-side protected route (redirects unauthenticated users).

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

import { ClientNewWorkoutPage } from './ClientNewWorkoutPage'

export default async function NewWorkoutPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  return <ClientNewWorkoutPage />
}
