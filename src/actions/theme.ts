'use server'

import { cookies } from 'next/headers'

export async function toggleThemeAction(current: string) {
  const next = current === 'dark' ? 'light' : 'dark'
  const store = await cookies()
  store.set('ai-theme', next, { path: '/', maxAge: 60 * 60 * 24 * 365 })
  return next
}
