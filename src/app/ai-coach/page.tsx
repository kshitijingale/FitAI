'use client'
// src/app/ai-coach/page.tsx
// The AI Coach chat page

import { useState, useRef, useEffect } from 'react'
import { useAiChat } from '@/hooks/useAiChat'

export default function AiCoachPage() {
  const { messages, isStreaming, error, sendMessage } = useAiChat()
  const [input,     setInput]     = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || isStreaming) return
    setInput('')
    await sendMessage(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Quick prompt suggestions for new users
  const suggestions = [
    'Build me a 4-week push/pull/legs program',
    'What should I eat to build muscle?',
    'Review my recent workouts and suggest improvements',
    'How do I improve my bench press?',
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm">← Back</a>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">AI</div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">FitAI Coach</p>
              <p className="text-xs text-green-500">Online · Knows your training history</p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-4">

          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🤖</div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Your AI Fitness Coach</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">I know your workout history and can build personalised programs, analyse your progress, and answer any fitness question.</p>
              <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                {suggestions.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-left text-sm text-gray-700 dark:text-gray-100 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat messages */}
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-sm'
              }`}>
                {/* Render newlines as line breaks */}
                {msg.content.split('\n').map((line, j) => (
                  <span key={j}>
                    {line}
                    {j < msg.content.split('\n').length - 1 && <br />}
                  </span>
                ))}
                {/* Blinking cursor while streaming */}
                {isStreaming && i === messages.length - 1 && msg.role === 'assistant' && (
                  <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />
                )}
              </div>
            </div>
          ))}

          {error && (
            <p className="text-center text-red-500 text-sm">{error}</p>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about workouts, nutrition, programs..."
            rows={1}
            className="flex-1 resize-none border border-gray-200 dark:border-gray-800 dark:bg-gray-800 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-gray-100"
            style={{ maxHeight: '120px' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="bg-blue-600 text-white px-4 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isStreaming ? '...' : 'Send'}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  )
}
