'use client'

import { useState } from 'react'
import { SignOutButton } from './SignOutButton'

export function ResponsiveNav() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/workouts', label: 'Workouts', icon: '💪' },
    { href: '/ai-coach', label: 'AI Coach', icon: '🤖' },
  ]

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="group relative px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all duration-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <span className="flex items-center gap-2">
              <span className="text-base group-hover:scale-110 transition-transform duration-200">
                {item.icon}
              </span>
              {item.label}
            </span>
            <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-blue-600 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
          </a>
        ))}
        <div className="ml-4 pl-4 border-l border-gray-200 dark:border-gray-700">
          <SignOutButton />
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden relative p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-sm hover:shadow-md"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
          <span className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? 'opacity-0' : 'opacity-100'}`}></span>
          <span className={`block h-0.5 w-5 bg-current transform transition-all duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        >
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-out animate-in slide-in-from-right-full border-l border-gray-200 dark:border-gray-800">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-105">
                    <span className="text-white font-bold text-sm">F</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                    FitAI
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-5 h-5 transition-transform duration-200 hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <a
                    key={item.href}
                    href={item.href}
                    className="group flex items-center gap-4 px-4 py-4 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-all duration-300 transform hover:scale-105"
                    onClick={() => setIsOpen(false)}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300 ease-out">
                      {item.icon}
                    </span>
                    <span className="font-medium transition-colors duration-200">{item.label}</span>
                    <svg className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                ))}

                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
                  <SignOutButton className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md" />
                </div>
              </nav>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center transition-colors duration-200">
                  🚀 Powered by AI • Built with ❤️
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}