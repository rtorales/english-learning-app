'use client'

import { useState, useTransition } from 'react'
import { createVocabCard } from '@/actions/vocabulary'

const PRESET_DECKS = ['Mis palabras', 'Expresiones', 'Phrasal verbs', 'Business English', 'Tech vocab']

interface AddCardFormProps {
  existingDecks: string[]
}

export function AddCardForm({ existingDecks }: AddCardFormProps) {
  const [open, setOpen] = useState(false)
  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [context, setContext] = useState('')
  const [deckName, setDeckName] = useState('Mis palabras')
  const [customDeck, setCustomDeck] = useState('')
  const [useCustom, setUseCustom] = useState(false)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  const allDecks = [...new Set([...PRESET_DECKS, ...existingDecks])]
  const finalDeck = useCustom ? customDeck.trim() : deckName

  function reset() {
    setFront(''); setBack(''); setContext(''); setError(''); setUseCustom(false); setCustomDeck('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!front.trim() || !back.trim() || !finalDeck) {
      setError('Completá la palabra en inglés, la traducción y el mazo.')
      return
    }
    setError('')
    startTransition(async () => {
      await createVocabCard({ front: front.trim(), back: back.trim(), context: context.trim() || undefined, deckName: finalDeck })
      reset()
      setOpen(false)
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'var(--bg-soft)', border: '1px solid var(--card-ring)',
    borderRadius: 10, fontSize: 15, color: 'var(--ink)',
    fontFamily: 'var(--f-body)', outline: 'none',
    boxSizing: 'border-box',
  }
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 700, color: 'var(--ink-3)',
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: 6,
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '0 20px', height: 44, borderRadius: 12,
          background: 'var(--primary)', color: '#fff',
          fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14,
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 0 var(--primary-2)',
        }}
      >
        <PlusIcon /> Nueva tarjeta
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(58,47,74,0.45)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 24,
        }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div style={{
            background: 'var(--card)', borderRadius: 24,
            border: '1px solid var(--card-ring)',
            boxShadow: 'var(--sh-3)',
            width: '100%', maxWidth: 520,
            padding: 28,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
                Nueva tarjeta
              </h2>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4 }}>
                <XIcon />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={labelStyle}>Palabra / frase en inglés *</label>
                <input value={front} onChange={e => setFront(e.target.value)} placeholder="e.g., pull request" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Traducción / significado *</label>
                <input value={back} onChange={e => setBack(e.target.value)} placeholder="e.g., solicitud de fusión de código" style={inputStyle} />
              </div>

              <div>
                <label style={labelStyle}>Ejemplo de uso (opcional)</label>
                <textarea
                  value={context} onChange={e => setContext(e.target.value)}
                  placeholder='e.g., "Please review my pull request before the deploy."'
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical', fontStyle: context ? 'normal' : 'italic' }}
                />
              </div>

              <div>
                <label style={labelStyle}>Mazo</label>
                {!useCustom ? (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select value={deckName} onChange={e => setDeckName(e.target.value)} style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}>
                      {allDecks.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <button type="button" onClick={() => setUseCustom(true)}
                      style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-soft)', border: '1px solid var(--card-ring)', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--f-sans)', fontWeight: 600 }}>
                      + Nuevo
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={customDeck} onChange={e => setCustomDeck(e.target.value)} placeholder="Nombre del nuevo mazo" style={{ ...inputStyle, flex: 1 }} />
                    <button type="button" onClick={() => setUseCustom(false)}
                      style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--bg-soft)', border: '1px solid var(--card-ring)', fontSize: 13, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--f-sans)', fontWeight: 600 }}>
                      Lista
                    </button>
                  </div>
                )}
              </div>

              {error && <p style={{ fontSize: 13, color: 'var(--coral)', fontWeight: 600, margin: 0 }}>{error}</p>}

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" onClick={() => { reset(); setOpen(false) }}
                  style={{ flex: 1, padding: '12px 0', borderRadius: 12, background: 'var(--bg-soft)', border: '1px solid var(--card-ring)', color: 'var(--ink-2)', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={pending}
                  style={{ flex: 2, padding: '12px 0', borderRadius: 12, background: pending ? 'var(--bg-soft)' : 'var(--primary)', color: pending ? 'var(--ink-4)' : '#fff', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15, border: 'none', cursor: pending ? 'not-allowed' : 'pointer', boxShadow: pending ? 'none' : '0 4px 0 var(--primary-2)' }}>
                  {pending ? 'Guardando…' : 'Guardar tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function PlusIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg> }
function XIcon() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg> }
