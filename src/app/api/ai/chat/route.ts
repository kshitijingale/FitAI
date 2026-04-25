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

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { messages, conversationId } = await request.json() as {
    messages:        ChatMessage[]
    conversationId?: string
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
  const [user, recentWorkouts] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.workoutSession.findMany({
      where:   { userId },
      include: { sets: { include: { exercise: true } } },
      orderBy: { date: 'desc' },
      take:    5,
    }),
  ])

  // Get personal records (heaviest weight for each exercise)
  const prs = await prisma.workoutSet.groupBy({
    by:     ['exerciseId'],
    where:  { workoutSession: { userId } },
    _max:   { weightKg: true, reps: true },
    orderBy: { exerciseId: 'asc' },
    take:   10,
  })

  const exerciseIds = prs.map(p => p.exerciseId)
  const exercises   = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  })

  return {
    goal:         user?.goal ?? 'BUILD_MUSCLE',
    fitnessLevel: user?.fitnessLevel ?? 'BEGINNER',
    recentWorkouts: recentWorkouts.map(w => ({
      date:       new Date(w.date).toLocaleDateString(),
      exercises:  [...new Set(w.sets.map(s => s.exercise.name))],
      totalSets:  w.sets.length,
    })),
    personalRecords: prs.map(pr => {
      const exercise = exercises.find(e => e.id === pr.exerciseId)
      return {
        exercise: exercise?.name ?? 'Unknown',
        weightKg: pr._max.weightKg ?? 0,
        reps:     pr._max.reps ?? 0,
      }
    }),
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
