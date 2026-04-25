// src/app/api/auth/register/route.ts
//
// Handles POST /api/auth/register
// Creates a new user with a hashed password

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { ApiResponse, SafeUser } from '@/types'

// ZOD SCHEMA: validates and types the request body in one step
// If any field is wrong, Zod gives a clear error message automatically
const registerSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // STEP 1: Validate the request body against our schema
    // If this fails, safeParse returns { success: false, error: ZodError }
    const result = registerSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: result.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // STEP 2: Check if email is already taken
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json<ApiResponse<never>>(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    // STEP 3: Hash the password — NEVER store plain text passwords
    // bcrypt hash is one-way: you can verify it but not reverse it
    const hashedPassword = await bcrypt.hash(password, 12)
    // The "12" is the salt rounds — higher = more secure but slower (12 is standard)

    // STEP 4: Create the user in the database
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    })

    // STEP 5: Return user data WITHOUT the password hash
    const { password: _, ...safeUser } = user

    return NextResponse.json<ApiResponse<SafeUser>>(
      { success: true, data: safeUser },
      { status: 201 }
    )
  } catch (error) {
    console.error('[REGISTER ERROR]', error)
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
