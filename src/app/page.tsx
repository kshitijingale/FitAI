// src/app/page.tsx
// The home page — redirects based on auth status

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  // If logged in, go to dashboard. If not, go to login.
  if (session) {
    redirect('/dashboard')
  } else {
    redirect('/login')
  }
}
