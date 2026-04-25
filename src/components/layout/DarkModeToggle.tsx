'use client'

import { useMemo } from 'react'

type EffectiveTheme = 'light' | 'dark'
type ThemeSetting = 'light' | 'dark' | 'system'

export function DarkModeToggle({
  effectiveTheme,
  themeSetting,
  onChangeThemeSetting,
}: {
  effectiveTheme: EffectiveTheme
  themeSetting: ThemeSetting
  onChangeThemeSetting: (next: ThemeSetting) => void
}) {
  const isDark = effectiveTheme === 'dark'
  const label = useMemo(() => {
    if (themeSetting === 'system') return `Dark mode (system: ${isDark ? 'on' : 'off'})`
    return `Dark mode: ${isDark ? 'on' : 'off'}`
  }, [isDark, themeSetting])

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onChangeThemeSetting(isDark ? 'light' : 'dark')}
      className="fixed bottom-4 right-4 z-50 inline-flex items-center justify-center w-11 h-11 rounded-full
                 bg-white/80 border border-black/5 shadow-sm text-gray-700
                 hover:bg-white dark:bg-gray-900/80 dark:border-white/10 dark:text-gray-200
                 backdrop-blur"
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 18a6 6 0 0 1 0-12c.3 0 .6.02.9.07A7.5 7.5 0 0 0 17.93 12c.05.3.07.6.07.9a6 6 0 0 1-6 5.1Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 2v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M22 12h-2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M17.66 4.34l-1.41 1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M19.66 19.66l-1.41-1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 2v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 20v2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m4.93 4.93 1.41 1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m17.66 17.66 1.41 1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M2 12h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M20 12h2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m4.93 19.07 1.41-1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="m17.66 6.34 1.41-1.41"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}

