// src/app/api/auth/[...nextauth]/route.ts
//
// This single file handles ALL auth routes:
//   POST /api/auth/signin
//   POST /api/auth/signout
//   GET  /api/auth/session
//   GET  /api/auth/callback/google
// ...and more. NextAuth handles all of this automatically.

import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)

// Next.js App Router needs named exports for each HTTP method
export { handler as GET, handler as POST }
