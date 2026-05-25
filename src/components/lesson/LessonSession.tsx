'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { completeModule } from '@/actions/progress'
import { recordStudySession } from '@/actions/vocabulary'

export interface TranslateExercise {
  questionEs: string
  answer: string[]
  wordBank: string[]
  label: string
  tip?: string
}

interface LessonSessionProps {
  moduleId: string
  moduleTitle: string
  exercises: TranslateExercise[]
  xpReward: number
  streakDays: number
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function LessonSession({ moduleId, moduleTitle, exercises, xpReward, streakDays }: LessonSessionProps) {
  // Shuffle word banks once on the client — avoids hydration mismatch and keeps order random per session
  const [shuffledBanks] = useState(() => exercises.map(ex => shuffleArray([...ex.wordBank])))

  const [current, setCurrent] = useState(0)
  const [slots, setSlots] = useState<Array<{ word: string; bankIdx: number }>>([])
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()
  const sessionStart = useRef(Date.now())
  const resultsRef = useRef<Array<{ questionText: string; correctAnswer: string; userAnswer: string; isCorrect: boolean }>>([])
  const scoreRef = useRef(0)

  const ex = exercises[current]
  const totalEx = exercises.length
  const usedBankIndices = new Set(slots.map(s => s.bankIdx))
  const wordBank = shuffledBanks[current]

  function addWord(word: string, bankIdx: number) {
    if (status !== 'idle' || usedBankIndices.has(bankIdx)) return
    setSlots(prev => [...prev, { word, bankIdx }])
  }

  function removeSlot(slotIdx: number) {
    if (status !== 'idle') return
    setSlots(prev => prev.filter((_, i) => i !== slotIdx))
  }

  function check() {
    const assembled = slots.map(s => s.word).join(' ').toLowerCase().trim()
    const correct = ex.answer.join(' ').toLowerCase().trim()
    const isCorrect = assembled === correct
    setStatus(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) {
      setScore(s => s + 1)
      scoreRef.current++
    }
    resultsRef.current.push({ questionText: ex.questionEs, correctAnswer: correct, userAnswer: assembled, isCorrect })
  }

  function next() {
    if (status === 'idle') {
      // skipped without checking
      resultsRef.current.push({ questionText: ex.questionEs, correctAnswer: ex.answer.join(' '), userAnswer: '', isCorrect: false })
    }
    if (current + 1 >= totalEx) {
      const finalScore = Math.round((scoreRef.current / totalEx) * 100)
      const durationSecs = Math.round((Date.now() - sessionStart.current) / 1000)
      startTransition(async () => {
        await Promise.all([
          completeModule({ moduleId, score: finalScore }),
          recordStudySession({
            type: 'lesson',
            moduleId,
            durationSecs,
            totalItems: totalEx,
            correctItems: scoreRef.current,
            xpEarned: xpReward,
            results: resultsRef.current,
          }),
        ])
        setDone(true)
      })
    } else {
      setCurrent(c => c + 1)
      setSlots([])
      setStatus('idle')
    }
  }

  if (done) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20, padding: 32,
      }}>
        <div style={{
          width: 96, height: 96, borderRadius: 24,
          background: 'linear-gradient(135deg, var(--accent), #f0c040)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 0 #b88d2f, 0 16px 40px rgba(232,185,97,0.3)',
        }}>
          <TrophyIcon />
        </div>
        <h2 style={{ fontFamily: 'var(--f-sans)', fontSize: 32, fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center', color: 'var(--ink)' }}>
          ¡Lección completada!
        </h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 16, textAlign: 'center', maxWidth: 400 }}>
          Completaste <strong style={{ color: 'var(--ink)' }}>{moduleTitle}</strong> con {score}/{totalEx} respuestas correctas.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 22px',
          background: 'color-mix(in oklab, var(--accent) 14%, transparent)',
          border: '1px solid color-mix(in oklab, var(--accent) 30%, transparent)',
          borderRadius: 16,
        }}>
          <BoltIcon size={22} color="var(--accent-2)" />
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', fontFamily: 'var(--f-sans)' }}>+{xpReward} XP</span>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ padding: '14px 24px', borderRadius: 14, background: 'var(--primary)', color: '#fff', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', boxShadow: '0 4px 0 var(--primary-2)' }}
          >
            Volver al inicio
          </button>
          <button
            onClick={() => router.push('/review')}
            style={{ padding: '14px 24px', borderRadius: 14, background: 'var(--card)', color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15, border: '1px solid var(--card-ring)', cursor: 'pointer', boxShadow: '0 3px 0 var(--card-ring)' }}
          >
            Repasar vocabulario
          </button>
        </div>
      </div>
    )
  }

  const isCorrect = status === 'correct'
  const isWrong = status === 'wrong'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Slim header */}
      <header style={{
        display: 'flex', alignItems: 'center', gap: 18,
        padding: '16px 32px',
        borderBottom: '1px solid var(--card-ring)',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          aria-label="Salir"
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--card)', border: '1px solid var(--card-ring)',
            color: 'var(--ink-2)', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <XIcon />
        </button>

        <div style={{ flex: 1, height: 12, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)' }}>
          <div style={{
            width: `${(current / totalEx) * 100}%`,
            height: '100%', background: 'var(--primary)', borderRadius: 999,
            transition: 'width 400ms ease',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: '2px 2px auto', height: '45%', background: 'linear-gradient(180deg,rgba(255,255,255,0.4),transparent)', borderRadius: 999 }} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14 }}>
          <FlameIcon size={18} />
          <span style={{ color: 'var(--ink)' }}>{streakDays}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14 }}>
          <BoltIcon size={18} color="var(--accent-2)" />
          <span style={{ color: 'var(--ink)' }}>+{xpReward}</span>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'auto', padding: '28px 32px 0', maxWidth: 820, width: '100%', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 999,
            background: 'color-mix(in oklab, var(--primary) 14%, transparent)',
            border: '1px solid color-mix(in oklab, var(--primary) 25%, transparent)',
            color: 'var(--primary-2)', fontWeight: 700, fontSize: 12,
            fontFamily: 'var(--f-sans)',
          }}>
            {ex.label}
          </span>
          <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--bg-soft)', border: '1px solid var(--card-ring)', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'var(--f-sans)' }}>
            Traducir frase
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, fontFamily: 'var(--f-sans)' }}>
            Pregunta {current + 1} de {totalEx}
          </span>
        </div>

        <h2 style={{ fontFamily: 'var(--f-sans)', fontSize: 28, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25, color: 'var(--ink)', marginBottom: 20 }}>
          Traducí esta frase al inglés
        </h2>

        {/* Spanish sentence */}
        <div style={{
          padding: '18px 20px',
          background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18,
          display: 'flex', alignItems: 'flex-start', gap: 14,
          fontSize: 19, fontWeight: 500, color: 'var(--ink)',
          fontFamily: 'var(--f-body)', lineHeight: 1.45,
          marginBottom: 24,
        }}>
          <button style={{
            flexShrink: 0, width: 40, height: 40, borderRadius: 10,
            background: 'var(--primary-tint)', color: 'var(--primary-2)',
            border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 0 color-mix(in oklab, var(--primary) 25%, transparent)',
          }}>
            <SpeakerIcon />
          </button>
          <p style={{ flex: 1, paddingTop: 4, margin: 0 }}>{ex.questionEs}</p>
        </div>

        {/* Answer slots */}
        <div style={{
          minHeight: 64, borderBottom: '2px solid var(--card-line)',
          display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center',
          paddingBottom: 10, marginBottom: 28,
        }}>
          {slots.map((slot, i) => (
            <button
              key={i}
              onClick={() => removeSlot(i)}
              style={{
                padding: '9px 14px',
                background: 'var(--primary)', color: '#fff',
                borderRadius: 10, fontSize: 15, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 3px 0 var(--primary-2)',
                fontFamily: 'var(--f-sans)',
              }}
            >
              {slot.word}
            </button>
          ))}
          {slots.length < ex.answer.length && (
            <div style={{ width: 80, height: 36, border: '2px dashed var(--card-line)', borderRadius: 10 }} />
          )}
        </div>

        {/* Word bank */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {wordBank.map((word, i) => {
            const used = usedBankIndices.has(i)
            return (
              <button
                key={i}
                disabled={used || status !== 'idle'}
                onClick={() => addWord(word, i)}
                style={{
                  padding: '11px 16px',
                  background: used ? 'var(--bg-soft)' : 'var(--card)',
                  border: '1px solid var(--card-ring)', borderRadius: 10,
                  fontSize: 15, fontWeight: 700,
                  color: used ? 'var(--ink-4)' : 'var(--ink)',
                  cursor: used ? 'not-allowed' : 'pointer',
                  boxShadow: used ? 'none' : '0 3px 0 var(--card-ring)',
                  fontFamily: 'var(--f-sans)', opacity: used ? 0.45 : 1,
                  transition: 'opacity 120ms',
                }}
              >
                {word}
              </button>
            )
          })}
        </div>

        {/* Tip */}
        {ex.tip && (
          <div style={{
            padding: '12px 16px',
            background: 'var(--accent-tint)',
            border: '1px solid color-mix(in oklab, var(--accent) 28%, transparent)',
            borderRadius: 14,
            display: 'flex', alignItems: 'flex-start', gap: 10,
            fontSize: 13, color: 'var(--ink-2)', marginBottom: 16,
          }}>
            <InfoIcon />
            <div>
              <strong style={{ color: 'var(--ink)' }}>Tip de sector — </strong>
              {ex.tip}
            </div>
          </div>
        )}

        {/* Result feedback */}
        {status !== 'idle' && (
          <div style={{
            padding: '14px 18px', borderRadius: 14, marginBottom: 16,
            background: isCorrect ? 'color-mix(in oklab, var(--sage) 16%, transparent)' : 'color-mix(in oklab, var(--coral) 12%, transparent)',
            border: `1px solid ${isCorrect ? 'var(--sage)' : 'var(--coral)'}`,
            display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 14,
          }}>
            <span style={{ fontSize: 18 }}>{isCorrect ? '✓' : '✗'}</span>
            <div>
              {isCorrect
                ? <><strong style={{ color: '#5b8a6e' }}>¡Correcto!</strong> Muy bien.</>
                : <><strong style={{ color: 'var(--coral)' }}>Incorrecto.</strong> La respuesta correcta es: <strong style={{ color: 'var(--ink)' }}>{ex.answer.join(' ')}</strong></>
              }
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        padding: '18px 32px',
        background: isCorrect
          ? 'color-mix(in oklab, var(--sage) 14%, var(--card-2))'
          : isWrong
          ? 'color-mix(in oklab, var(--coral) 10%, var(--card-2))'
          : 'var(--card-2)',
        borderTop: `2px solid ${isCorrect ? 'var(--sage)' : isWrong ? 'var(--coral)' : 'var(--card-ring)'}`,
        display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between',
        flexShrink: 0, transition: 'background 200ms, border-color 200ms',
      }}>
        {status === 'idle' ? (
          <>
            <button
              onClick={next}
              style={{ padding: '12px 18px', borderRadius: 12, background: 'transparent', border: '2px solid var(--card-ring)', color: 'var(--ink-2)', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              No sé esta
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={next}
                style={{ padding: '12px 22px', borderRadius: 12, background: 'var(--card)', border: '1px solid var(--card-ring)', color: 'var(--ink)', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 3px 0 var(--card-ring)' }}
              >
                Saltar
              </button>
              <button
                onClick={check}
                disabled={slots.length === 0}
                style={{
                  padding: '12px 26px', borderRadius: 12,
                  background: slots.length === 0 ? 'var(--bg-soft)' : 'var(--sage)',
                  color: slots.length === 0 ? 'var(--ink-4)' : '#fff',
                  fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15,
                  border: 'none', cursor: slots.length === 0 ? 'not-allowed' : 'pointer',
                  boxShadow: slots.length === 0 ? 'none' : '0 4px 0 #5b8a6e',
                  display: 'flex', alignItems: 'center', gap: 8,
                  transition: 'background 140ms, box-shadow 140ms',
                }}
              >
                Comprobar <CheckIcon />
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--f-sans)', color: isCorrect ? '#5b8a6e' : 'var(--coral)' }}>
              {isCorrect ? '¡Excelente!' : 'Seguí practicando'}
            </span>
            <button
              onClick={next}
              style={{
                padding: '12px 28px', borderRadius: 12,
                background: isCorrect ? 'var(--sage)' : 'var(--coral)',
                color: '#fff', fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15,
                border: 'none', cursor: 'pointer',
                boxShadow: `0 4px 0 ${isCorrect ? '#5b8a6e' : '#b3635a'}`,
              }}
            >
              {current + 1 >= totalEx ? 'Ver resultados' : 'Continuar'}
            </button>
          </>
        )}
      </footer>
    </div>
  )
}

/* ---- Icons ---- */
function XIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
}
function FlameIcon({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--coral)" strokeWidth="2.25" strokeLinecap="round"><path d="M8.5 14c0-3 3.5-4 3.5-9 3 2 7 5 7 10a7 7 0 0 1-14 0c0-2 1-3.5 2-4.5 0 1.5.7 2.5 1.5 3.5z"/></svg>
}
function BoltIcon({ size = 18, color = 'currentColor' }: { size?: number; color?: string }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>
}
function SpeakerIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
}
function TrophyIcon() {
  return <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M17 4h3v2a3 3 0 0 1-3 3M7 4H4v2a3 3 0 0 0 3 3"/></svg>
}
function CheckIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6 9 17l-5-5"/></svg>
}
function InfoIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-2)" strokeWidth="2.25" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
}
