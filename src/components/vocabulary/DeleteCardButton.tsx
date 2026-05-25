'use client'

import { useTransition } from 'react'
import { deleteVocabCard } from '@/actions/vocabulary'

export function DeleteCardButton({ cardId }: { cardId: string }) {
  const [pending, start] = useTransition()

  function handleDelete() {
    if (!confirm('¿Eliminar esta tarjeta?')) return
    start(async () => { await deleteVocabCard(cardId) })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={pending}
      title="Eliminar tarjeta"
      style={{
        width: 30, height: 30, borderRadius: 8,
        background: 'none', border: '1px solid var(--card-ring)',
        color: pending ? 'var(--ink-4)' : 'var(--coral)',
        cursor: pending ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        opacity: pending ? 0.5 : 1,
        transition: 'opacity 150ms',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
      </svg>
    </button>
  )
}
