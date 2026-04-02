'use client'
// src/components/layout/SessionProvider.tsx
//
// WHY THIS FILE EXISTS:
// Next.js App Router runs components on the server by default.
// NextAuth's SessionProvider is a React context — it needs "use client".
// We can't put "use client" in layout.tsx (it's a server component),
// so we wrap it in this tiny client component instead.
// This is a common Next.js App Router pattern you'll use a lot.

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
