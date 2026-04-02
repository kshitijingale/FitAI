// src/types/next-auth.d.ts
//
// WHY THIS FILE EXISTS:
// By default, NextAuth's session.user only has { name, email, image }.
// We added an `id` field in our auth callbacks, but TypeScript doesn't
// know about it yet — it would show an error if you wrote session.user.id
//
// This file EXTENDS NextAuth's built-in types to include our custom fields.
// The "declare module" syntax is called "module augmentation" — a TypeScript
// pattern for adding fields to types you don't own.

import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string   // Add id to the user object
    } & DefaultSession['user']
    // & means "and also include everything from DefaultSession['user']"
    // so the final type is: { id: string, name?, email?, image? }
  }
}
