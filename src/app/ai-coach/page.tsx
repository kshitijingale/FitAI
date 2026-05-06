// src/app/ai-coach/page.tsx
// Server-side protected route (redirects unauthenticated users).

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

import { ClientAiCoach } from './ClientAiCoach'

export default async function AiCoachPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login')

  return <ClientAiCoach />
}
