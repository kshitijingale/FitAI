// src/lib/ai.ts
//
// ─── AI PROVIDER ABSTRACTION ──────────────────────────────────────────────────
//
// WHY THIS FILE EXISTS:
// AI providers all have slightly different SDKs and response shapes.
// Without this file, swapping from Groq → Gemini → Claude means editing
// every file that calls the AI. With this file, you change ONE line here
// and the rest of the app works automatically.
//
// This is the "Adapter" design pattern — a classic software engineering concept.
//
// ─── HOW TO SWITCH PROVIDERS ──────────────────────────────────────────────────
// Change the ACTIVE_PROVIDER value below. That's it.
// Make sure the corresponding API key is set in your .env.local.

export type AiMessage = {
  role:    'user' | 'assistant' | 'system'
  content: string
}

// Return type of streamChat — an async generator that yields text chunks
export type StreamResult = AsyncGenerator<string, void, unknown>

// The interface every provider must implement
// If you add a new provider, it just needs to implement these two functions
export interface AiProvider {
  name:       string
  streamChat: (messages: AiMessage[], systemPrompt: string) => Promise<StreamResult>
}

// ─── PROVIDER: GROQ ───────────────────────────────────────────────────────────
// Free tier: 14,400 requests/day, ultra-fast inference
// Models: llama-3.3-70b-versatile (best), llama-3.1-8b-instant (fastest)
// Docs: console.groq.com

async function* groqStream(messages: AiMessage[], systemPrompt: string): StreamResult {
  // Groq uses the OpenAI-compatible API format
  // We use fetch() directly so we don't need the groq-sdk package
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  1024,
      stream:      true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Groq API error: ${res.status} ${error}`)
  }

  // STREAMING PARSE:
  // Groq sends Server-Sent Events (SSE) — lines like:
  //   data: {"choices":[{"delta":{"content":"Hello"}}]}
  //   data: [DONE]
  //
  // We read the raw stream, split by newlines, and extract the text delta
  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''   // keep the incomplete last line in the buffer

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed === 'data: [DONE]') continue
      if (!trimmed.startsWith('data: ')) continue

      try {
        const json  = JSON.parse(trimmed.slice(6))   // strip "data: " prefix
        const chunk = json.choices?.[0]?.delta?.content
        if (chunk) yield chunk   // yield each text chunk to the caller
      } catch {
        // skip malformed lines
      }
    }
  }
}

const groqProvider: AiProvider = {
  name:       'Groq (Llama 3.3 70B)',
  streamChat: async (messages, systemPrompt) => groqStream(messages, systemPrompt),
}

// ─── PROVIDER: GEMINI ─────────────────────────────────────────────────────────
// Free tier: 15 requests/min, 1M tokens/day — no credit card needed
// Models: gemini-1.5-flash (fast + free), gemini-1.5-pro (smarter, limited)
// Get key: aistudio.google.com

async function* geminiStream(messages: AiMessage[], systemPrompt: string): StreamResult {
  const apiKey = process.env.GEMINI_API_KEY
  const url    = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`

  // Gemini uses a different message format — "parts" instead of "content"
  // And system prompt is separate from the conversation history
  const contents = messages.map(m => ({
    role:  m.role === 'assistant' ? 'model' : 'user',  // Gemini uses "model" not "assistant"
    parts: [{ text: m.content }],
  }))

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Gemini API error: ${res.status} ${error}`)
  }

  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue

      try {
        const json  = JSON.parse(trimmed.slice(6))
        const chunk = json.candidates?.[0]?.content?.parts?.[0]?.text
        if (chunk) yield chunk
      } catch {
        // skip malformed lines
      }
    }
  }
}

const geminiProvider: AiProvider = {
  name:       'Google Gemini 1.5 Flash',
  streamChat: async (messages, systemPrompt) => geminiStream(messages, systemPrompt),
}

// ─── PROVIDER: ANTHROPIC (CLAUDE) ─────────────────────────────────────────────
// Paid — best quality. Use this when you're ready to go production.
// Get key: console.anthropic.com

async function* anthropicStream(messages: AiMessage[], systemPrompt: string): StreamResult {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method:  'POST',
    headers: {
      'x-api-key':         process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-sonnet-4-5',
      max_tokens: 1024,
      stream:     true,
      system:     systemPrompt,
      messages:   messages
        .filter(m => m.role !== 'system')
        .map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Anthropic API error: ${res.status} ${error}`)
  }

  const reader  = res.body!.getReader()
  const decoder = new TextDecoder()
  let   buffer  = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue

      try {
        const json = JSON.parse(trimmed.slice(6))
        if (json.type === 'content_block_delta' && json.delta?.type === 'text_delta') {
          yield json.delta.text
        }
      } catch {
        // skip malformed lines
      }
    }
  }
}

const anthropicProvider: AiProvider = {
  name:       'Anthropic Claude Sonnet',
  streamChat: async (messages, systemPrompt) => anthropicStream(messages, systemPrompt),
}

// ─── ACTIVE PROVIDER ──────────────────────────────────────────────────────────
//
// ✅ CHANGE THIS LINE to switch providers. Options:
//   groqProvider      — free, fast,    needs GROQ_API_KEY
//   geminiProvider    — free, good,    needs GEMINI_API_KEY
//   anthropicProvider — paid, best,    needs ANTHROPIC_API_KEY
//
const ACTIVE_PROVIDER: AiProvider = groqProvider

export const aiProvider = ACTIVE_PROVIDER

// ─── USAGE EXAMPLE ────────────────────────────────────────────────────────────
//
// import { aiProvider } from '@/lib/ai'
//
// const stream = await aiProvider.streamChat(messages, systemPrompt)
// for await (const chunk of stream) {
//   // chunk = one piece of text, e.g. "Hello" or " there"
//   controller.enqueue(encoder.encode(chunk))
// }
