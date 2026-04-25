'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { DarkModeToggle } from './DarkModeToggle'

type ThemeSetting = 'light' | 'dark' | 'system'
type EffectiveTheme = 'light' | 'dark'

const STORAGE_KEY = 'fitai-theme-setting'

function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

function applyDarkClass(shouldBeDark: boolean) {
  document.documentElement.classList.toggle('dark', shouldBeDark)
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeSetting, setThemeSetting] = useState<ThemeSetting>(() => {
    // Read from localStorage synchronously (theme is already applied by script)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored
      }
    }
    return 'system'
  })

  const effectiveTheme: EffectiveTheme = useMemo(() => {
    if (themeSetting === 'dark') return 'dark'
    if (themeSetting === 'light') return 'light'
    return getSystemPrefersDark() ? 'dark' : 'light'
  }, [themeSetting])

  // Only apply theme when it changes dynamically (not on initial mount)
  useEffect(() => {
    const shouldBeDark = effectiveTheme === 'dark'
    applyDarkClass(shouldBeDark)
  }, [effectiveTheme])

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')

    // Only respond to system changes when user hasn't overridden.
    if (themeSetting !== 'system') return

    const onChange = () => {
      applyDarkClass(getSystemPrefersDark())
    }

    // Safari fallback for older listeners (TypeScript doesn't always model addListener/removeListener)
    const anyMql = mql as any
    if (typeof anyMql.addEventListener === 'function') anyMql.addEventListener('change', onChange)
    else if (typeof anyMql.addListener === 'function') anyMql.addListener(onChange)

    return () => {
      if (typeof anyMql.removeEventListener === 'function') anyMql.removeEventListener('change', onChange)
      else if (typeof anyMql.removeListener === 'function') anyMql.removeListener(onChange)
    }
  }, [themeSetting])

  return (
    <>
      {children}
      <DarkModeToggle
        effectiveTheme={effectiveTheme}
        themeSetting={themeSetting}
        onChangeThemeSetting={(next) => {
          setThemeSetting(next)
          localStorage.setItem(STORAGE_KEY, next)
        }}
      />
    </>
  )
}

