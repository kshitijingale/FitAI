'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton({ className = "text-sm text-red-500 hover:text-red-700 transition-colors duration-200" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className}
    >
      Sign out
    </button>
  )
}
