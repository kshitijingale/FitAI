'use client'

import { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  trigger?: 'hover' | 'click'
}

export function Tooltip({ content, children, side = 'top', trigger = 'click' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (trigger !== 'click') return

    function handleClickOutside(event: MouseEvent) {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false)
      }
    }

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isVisible, trigger])

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900 dark:border-t-white border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900 dark:border-b-white border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-white border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-white border-t-transparent border-b-transparent border-l-transparent',
  }

  const handleTrigger = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (trigger === 'click') {
      setIsVisible(!isVisible)
    }
  }

  return (
    <div className="relative inline-block" ref={tooltipRef}>
      <button
        type="button"
        onClick={trigger === 'click' ? handleTrigger : undefined}
        onMouseEnter={trigger === 'hover' ? () => setIsVisible(true) : undefined}
        onMouseLeave={trigger === 'hover' ? () => setIsVisible(false) : undefined}
        className={`${trigger === 'click' ? 'cursor-pointer' : 'cursor-help'} bg-none border-none p-0`}
      >
        {children}
      </button>

      {isVisible && (
        <div
          className={`absolute ${positionClasses[side]} z-50 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs px-3 py-2 rounded shadow-lg pointer-events-none max-w-xs`}
        >
          {content}
          <div className={`absolute w-0 h-0 border-4 ${arrowClasses[side]}`}></div>
        </div>
      )}
    </div>
  )
}
