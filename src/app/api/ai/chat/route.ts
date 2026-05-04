// src/app/api/ai/chat/route.ts
//
// POST /api/ai/chat
//
// The AI coach endpoint. Streams responses token-by-token.
//
// ✅ TO SWITCH AI PROVIDER: edit src/lib/ai.ts — change ACTIVE_PROVIDER.
//    This file never needs to change when you swap providers.

import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/prisma'
import { aiProvider }       from '@/lib/ai'     // ← the only AI import needed
import type { ChatMessage, UserFitnessContext } from '@/types'
import { z } from 'zod'

const ChatPayloadSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().min(1).max(8000),
      })
    )
    .min(1)
    .max(50),
  conversationId: z.string().min(1).max(128).optional(),
})

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  let json: unknown
  try {
    json = await request.json()
  } catch {
    return new Response('Invalid JSON body', { status: 400 })
  }

  const parsed = ChatPayloadSchema.safeParse(json)
  if (!parsed.success) {
    return new Response('Invalid request payload', { status: 400 })
  }

  const { messages, conversationId } = parsed.data as {
    messages: ChatMessage[]
    conversationId?: string
  }

  // If a conversationId is provided, ensure the user owns it before streaming.
  if (conversationId) {
    const owned = await prisma.aiConversation.findFirst({
      where: { id: conversationId, userId: session.user.id },
      select: { id: true },
    })
    if (!owned) return new Response('Conversation not found', { status: 404 })
  }

  // STEP 1: Fetch user's fitness data so the AI has personalised context
  const context      = await getUserFitnessContext(session.user.id)
  const systemPrompt = buildSystemPrompt(context)

  // STEP 2: Collect the full response text as we stream it
  // We need this to save to the database after streaming finishes
  let fullAssistantText = ''
  const encoder = new TextEncoder()

  // STEP 3: Create a streaming HTTP response
  // ReadableStream pushes data to the client as it arrives, chunk by chunk
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // aiProvider.streamChat() returns an async generator —
        // a function that yields values over time (like a lazy array)
        // "for await...of" reads each yielded value as it arrives
        const chunks = await aiProvider.streamChat(messages, systemPrompt)

        for await (const chunk of chunks) {
          fullAssistantText += chunk
          controller.enqueue(encoder.encode(chunk))
        }

        // STEP 4: Save to DB once streaming is complete
        await saveConversation(
          session.user.id,
          conversationId,
          messages,
          fullAssistantText
        )

      } catch (error) {
        console.error(`[AI CHAT ERROR] Provider: ${aiProvider.name}`, error)
        controller.enqueue(encoder.encode(
          '\n\nSorry, I ran into an error. Please try again.'
        ))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':     'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'X-AI-Provider':    aiProvider.name,   // helpful for debugging in DevTools
    },
  })
}

// ─── BUILD AI SYSTEM PROMPT ───────────────────────────────────────────────────
// This is the "personality" and "knowledge" of the AI coach.
// By injecting the user's actual data, responses are personalised.

function buildSystemPrompt(context: UserFitnessContext): string {
  return `You are FitAI, a knowledgeable and motivating personal fitness coach.
You have access to the user's training history and fitness profile.

USER PROFILE:
- Goal: ${context.goal}
- Fitness level: ${context.fitnessLevel}

RECENT WORKOUTS (last 5 sessions):
${context.recentWorkouts.map(w =>
  `- ${w.date}: ${w.exercises.join(', ')} (${w.totalSets} sets)`
).join('\n')}

PERSONAL RECORDS:
${context.personalRecords.map(pr =>
  `- ${pr.exercise}: ${pr.weightKg}kg × ${pr.reps} reps`
).join('\n')}

GUIDELINES:
- Give specific, actionable advice based on their actual training data
- Reference their recent workouts and PRs when relevant
- Be encouraging but honest — don't give advice that could cause injury
- Keep responses concise — use bullet points for workout plans
- If they ask for a program, structure it clearly by day/week
- When estimating macros or calories, always clarify these are approximations`
}

// ─── FETCH USER FITNESS CONTEXT ───────────────────────────────────────────────

async function getUserFitnessContext(userId: string): Promise<UserFitnessContext> {
  // Sequential queries to avoid prepared statement issues in serverless
  const user = await prisma.user.findUnique({ where: { id: userId } })
  const recentWorkouts = await prisma.workoutSession.findMany({
    where:   { userId },
    include: { sets: { include: { exercise: true } } },
    orderBy: { date: 'desc' },
    take:    5,
  })

  // Personal records: pick the single best set per exercise by max weight,
  // then tie-break by reps, ensuring weightKg and reps come from the same row.
  const prSets = await prisma.workoutSet.findMany({
    where: { workoutSession: { userId } },
    orderBy: [{ weightKg: 'desc' }, { reps: 'desc' }],
    distinct: ['exerciseId'],
    take: 10,
    include: { exercise: true },
  })

  return {
    goal:         user?.goal ?? 'BUILD_MUSCLE',
    fitnessLevel: user?.fitnessLevel ?? 'BEGINNER',
    recentWorkouts: recentWorkouts.map(w => ({
      date:       new Date(w.date).toLocaleDateString(),
      exercises:  [...new Set(w.sets.map(s => s.exercise.name))],
      totalSets:  w.sets.length,
    })),
    personalRecords: prSets.map(set => ({
      exercise: set.exercise.name,
      weightKg: set.weightKg,
      reps: set.reps,
    })),
  }
}

// ─── SAVE CONVERSATION ────────────────────────────────────────────────────────

async function saveConversation(
  userId: string,
  conversationId: string | undefined,
  messages: ChatMessage[],
  assistantResponse: string
) {
  const lastUserMessage = messages[messages.length - 1]?.content ?? ''

  if (conversationId) {
    // Add to existing conversation
    await prisma.aiMessage.createMany({
      data: [
        { conversationId, role: 'user',      content: lastUserMessage },
        { conversationId, role: 'assistant', content: assistantResponse },
      ],
    })
  } else {
    // Create a new conversation
    await prisma.aiConversation.create({
      data: {
        userId,
        title:    lastUserMessage.slice(0, 60), // first 60 chars as title
        messages: {
          create: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'assistant' as const, content: assistantResponse },
          ],
        },
      },
    })
  }
}
