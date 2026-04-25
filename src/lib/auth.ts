// src/lib/auth.ts
//
// This is the central NextAuth config.
// It defines HOW users can log in (providers) and
// what extra data to include in the session (callbacks).

import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  // Adapter = tells NextAuth to store sessions/users in YOUR database (not in memory)
  adapter: PrismaAdapter(prisma) as any,

  providers: [
    // EMAIL + PASSWORD login
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // This function runs when a user tries to log in with email/password
        if (!credentials?.email || !credentials?.password) return null

        // 1. Find user in database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        // 2. Compare password against the bcrypt hash stored in DB
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        // 3. Return user object — NextAuth creates a session from this
        return { id: user.id, email: user.email, name: user.name }
      },
    }),

    // GOOGLE OAUTH (optional — comment out if not needed yet)
    ...(process.env.GOOGLE_CLIENT_ID ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ] : []),
  ],

  session: {
    strategy: 'jwt',
    // JWT = session stored in a cookie, not in the database
    // Simpler than database sessions for a solo project
  },

  callbacks: {
    // The JWT callback runs every time a JWT is created or updated
    async jwt({ token, user }) {
      // On first sign-in, `user` is available — add its id to the token
      if (user) token.id = user.id
      return token
    },

    // The session callback runs every time session data is requested
    async session({ session, token }) {
      // Pass the user id from the token into the session object
      // Now you can do: session.user.id in any component
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  pages: {
    signIn: '/login',  // Redirect to our custom login page instead of NextAuth's default
  },
}
