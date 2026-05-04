'use client'
// src/hooks/useAiChat.ts
//
// Custom hook for the AI Coach chat with STREAMING support.
//
// HOW STREAMING WORKS:
// Normal fetch: send request → wait → get full response
// Streaming:    send request → receive tokens one by one as they arrive
//
// This makes the AI feel like it's "typing" in real time.
// We read the stream chunk by chunk and append to the message.

import { useState, useCallback } from 'react'
import type { ChatMessage } from '@/types'

type UseAiChatReturn = {
  messages:      ChatMessage[]
  isStreaming:   boolean
  error:         string | null
  sendMessage:   (content: string) => Promise<void>
  retryLast:     () => Promise<void>
  clearMessages: () => void
}

export function useAiChat(conversationId?: string): UseAiChatReturn {
  const [messages,    setMessages]    = useState<ChatMessage[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [lastFailedUserMessage, setLastFailedUserMessage] = useState<string | null>(null)

  const runRequest = useCallback(async (nextMessages: ChatMessage[], failedUserContent?: string) => {
    setError(null)
    setIsStreaming(true)

    // Add an empty assistant message — we'll fill it in as tokens arrive
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          messages: nextMessages,
          conversationId,
        }),
      })

      if (!res.ok) throw new Error('Failed to get AI response')
      if (!res.body) throw new Error('No response body')

      // 3. Read the streaming response
      const reader  = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and append it to the last (assistant) message
        const chunk = decoder.decode(value, { stream: true })

        setMessages(prev => {
          const updated = [...prev]
          const last    = updated[updated.length - 1]
          // Only update if the last message is the assistant's
          if (last.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            }
          }
          return updated
        })
      }

      // Clear any previous failure once we successfully streamed.
      setLastFailedUserMessage(null)
    } catch (err) {
      setError('Failed to connect to AI coach. Please try again.')
      if (failedUserContent) setLastFailedUserMessage(failedUserContent)
      // Remove the empty assistant message if streaming failed
      setMessages(prev => prev.filter((_, i) => i !== prev.length - 1))
    } finally {
      setIsStreaming(false)
    }
  }, [conversationId])

  const sendMessage = useCallback(async (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    // Add the user's message to the chat immediately.
    const nextMessages = [...messages, { role: 'user', content: trimmed } satisfies ChatMessage]
    setMessages(nextMessages)

    await runRequest(nextMessages, trimmed)
  }, [messages, runRequest])

  const retryLast = useCallback(async () => {
    if (!lastFailedUserMessage) return
    // Retry against the current conversation history (no duplicate user message).
    await runRequest(messages, lastFailedUserMessage)
  }, [lastFailedUserMessage, messages, runRequest])

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
    setLastFailedUserMessage(null)
  }, [])

  return { messages, isStreaming, error, sendMessage, retryLast, clearMessages }
}
