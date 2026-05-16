'use client'

import { useTransition } from 'react'
import { toggleThemeAction } from '@/actions/theme'

interface ThemeToggleProps {
  theme: string
}

export function ThemeToggle({ theme }: ThemeToggleProps) {
  const [, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      await toggleThemeAction(theme)
      document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'light' : 'dark')
    })
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Cambiar tema"
      style={{
        width: 38, height: 38, borderRadius: 12,
        background: 'var(--card)',
        border: '1px solid var(--card-ring)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--ink-2)',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4"/>
          <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A8 8 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>
        </svg>
      )}
    </button>
  )
}
