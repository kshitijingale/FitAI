// src/app/layout.tsx
// The root layout wraps every page in the app.
// SessionProvider makes the auth session available to ALL components.

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { SessionProvider } from '@/components/layout/SessionProvider'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FitAI — Your AI Fitness Coach',
  description: 'Track workouts, log nutrition, and get personalised coaching powered by AI.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('fitai-theme-setting');
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                let isDark = systemDark;
                if (theme === 'dark') isDark = true;
                else if (theme === 'light') isDark = false;
                else if (theme === 'system') isDark = systemDark;
                if (isDark) document.documentElement.classList.add('dark');
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SessionProvider>{children}</SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
