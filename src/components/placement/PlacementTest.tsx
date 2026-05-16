'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitPlacementTest } from '@/actions/placement'
import { createCATSession, selectNextDifficulty, shouldTerminate, estimateCEFRLevel } from '@/lib/cat-engine'
import type { CATSession, CATAnswer } from '@/lib/cat-engine'
import { SAMPLE_QUESTIONS } from './sample-questions'
import { SECTORS } from '@/types'
import type { ProfessionalSector, CEFRLevel } from '@/types'

type Phase = 'sector-select' | 'testing' | 'submitting'

const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const CEFR_POS: Record<CEFRLevel, number> = { A1: 0, A2: 20, B1: 40, B2: 57, C1: 74, C2: 92 }
const CEFR_COLORS: Record<CEFRLevel, string> = {
  A1: '#9bc998', A2: '#9bc998', B1: '#e8b961', B2: '#e8b961', C1: '#8b6db5', C2: '#8b6db5',
}

export function PlacementTest() {
  const [phase, setPhase] = useState<Phase>('sector-select')
  const [sector, setSector] = useState<ProfessionalSector | null>(null)
  const [session, setSession] = useState<CATSession>(createCATSession())
  const [startTime, setStartTime] = useState(0)

  const answeredIds = new Set(session.answers.map((a) => a.questionId))
  const unasked = SAMPLE_QUESTIONS.filter((q) => !answeredIds.has(q.id))
  const currentQuestion =
    unasked.find((q) => Math.abs(q.difficulty - session.currentDifficulty) <= 1.5) ??
    [...unasked].sort((a, b) => Math.abs(a.difficulty - session.currentDifficulty) - Math.abs(b.difficulty - session.currentDifficulty))[0]

  const estimatedLevel = session.answers.length > 0 ? estimateCEFRLevel(session) : null
  const correctCount = session.answers.filter(a => a.correct).length

  function handleSectorSelect(s: ProfessionalSector) {
    setSector(s)
    setPhase('testing')
    setStartTime(Date.now())
  }

  async function handleAnswer(selectedIndex: number) {
    if (!currentQuestion) return
    const timeMs = Date.now() - startTime
    const correct = selectedIndex === currentQuestion.correctIndex
    const newAnswer: CATAnswer = {
      questionId: currentQuestion.id,
      selectedIndex, correct, timeMs,
      difficulty: session.currentDifficulty,
    }
    const newSession: CATSession = {
      ...session,
      answers: [...session.answers, newAnswer],
      currentDifficulty: selectNextDifficulty({ ...session, answers: [...session.answers, newAnswer] }),
    }
    setSession(newSession)
    setStartTime(Date.now())
    if (shouldTerminate(newSession)) {
      setPhase('submitting')
      await submitPlacementTest({ sector: sector!, session: newSession })
    }
  }

  /* ---- Sector select ---- */
  if (phase === 'sector-select') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '0 24px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px 5px 8px', borderRadius: 999, background: 'var(--primary-tint)', border: '1px solid var(--primary-soft)', fontSize: 12, fontWeight: 700, color: 'var(--primary-2)', marginBottom: 16 }}>
              <SparklesIcon /> Test adaptativo · CEFR A1 → C2
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 10 }}>Test de Posicionamiento</h1>
            <p style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.55, maxWidth: 400, margin: '0 auto' }}>
              Este test adaptativo determina tu nivel CEFR y personaliza tu ruta de aprendizaje.
            </p>
          </div>

          <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 20, padding: 24, boxShadow: 'var(--sh-2)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 16 }}>¿Cuál es tu sector profesional?</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {SECTORS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleSectorSelect(s.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', borderRadius: 12,
                    background: 'var(--card)',
                    border: '1px solid var(--card-ring)',
                    color: 'var(--ink)',
                    fontFamily: 'var(--f-sans)', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'border-color 140ms, background 140ms',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--primary)'; (e.currentTarget as HTMLElement).style.background = 'var(--primary-tint)'; (e.currentTarget as HTMLElement).style.color = 'var(--primary-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-ring)'; (e.currentTarget as HTMLElement).style.background = 'var(--card)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
              El test toma aproximadamente 8–14 preguntas · ~5 minutos
            </p>
          </div>
        </div>
      </div>
    )
  }

  /* ---- Submitting ---- */
  if (phase === 'submitting') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16, animation: 'spin 1s linear infinite', display: 'inline-block' }}>⚙️</div>
          <p style={{ color: 'var(--ink-3)', fontSize: 16, fontWeight: 600 }}>Calculando tu nivel...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  /* ---- Testing ---- */
  const progress = (session.answers.length / 20) * 100

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 28, padding: '28px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

      {/* Left — question */}
      <div>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 999, background: 'var(--primary-soft)', color: 'var(--primary-2)', fontSize: 12, fontWeight: 700 }}>
            <TargetIcon /> Test adaptativo · CEFR
          </span>
          <CefrPill level={currentQuestion?.cefrLevel ?? 'B1'} />
          <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--ink-3)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ClockIcon /> Pregunta {session.answers.length + 1} de ~14
          </span>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 20 }}>
          <ProgressBar value={session.answers.length} max={20} />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion?.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.18 }}
          >
            {currentQuestion?.text.includes('\n') || currentQuestion?.text.length > 120 ? (
              <div style={{ padding: 20, background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 16, fontSize: 15, lineHeight: 1.7, color: 'var(--ink)', marginBottom: 14, fontFamily: 'var(--f-body)' }}>
                {currentQuestion?.text}
              </div>
            ) : null}

            <h2 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--ink)', marginBottom: 16 }}>
              {currentQuestion?.text}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    background: 'var(--card)',
                    border: '2px solid var(--card-ring)',
                    borderRadius: 14,
                    cursor: 'pointer', textAlign: 'left',
                    fontSize: 15, color: 'var(--ink)', fontWeight: 500,
                    fontFamily: 'var(--f-body)',
                    transition: 'border-color 140ms, background 140ms',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--primary)'
                    el.style.background = 'var(--primary-tint)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--card-ring)'
                    el.style.background = 'var(--card)'
                  }}
                >
                  <span style={{
                    width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                    background: 'var(--bg-soft)', color: 'var(--ink-3)',
                    fontSize: 13, fontWeight: 800,
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--f-sans)',
                  }}>
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span style={{ flex: 1 }}>{option}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right — adaptive meter */}
      <aside style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Real-time estimate */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18, padding: 20, boxShadow: 'var(--sh-1)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Estimación en tiempo real</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 38, fontWeight: 700, fontFamily: 'var(--f-sans)', letterSpacing: '-0.03em', color: estimatedLevel ? CEFR_COLORS[estimatedLevel] : 'var(--ink-3)' }}>
              {estimatedLevel ?? '—'}
            </span>
            <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>
              {estimatedLevel ? levelLabel(estimatedLevel) : 'calculando...'}
            </span>
          </div>

          {/* CEFR track */}
          <div style={{ position: 'relative', marginBottom: 4 }}>
            <div style={{
              height: 12, borderRadius: 999, overflow: 'hidden',
              background: 'linear-gradient(90deg, #9bc998 0%, #9bc998 33%, #e8b961 33%, #e8b961 66%, #8b6db5 66%)',
            }} />
            {estimatedLevel && (
              <div style={{
                position: 'absolute', top: -3,
                left: `calc(${CEFR_POS[estimatedLevel]}% - 9px)`,
                width: 18, height: 18, borderRadius: '50%',
                background: '#fff', border: '3px solid var(--ink)',
                boxShadow: 'var(--sh-2)',
                transition: 'left 600ms cubic-bezier(.4,.6,.2,1)',
              }} />
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
              {CEFR_LEVELS.map(l => (
                <span key={l} style={{ color: l === estimatedLevel ? 'var(--ink)' : 'var(--ink-3)' }}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Progress breakdown */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--card-ring)', borderRadius: 18, padding: 20, boxShadow: 'var(--sh-1)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Cómo va tu test</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { l: 'Preguntas respondidas', v: session.answers.length, max: 20, c: 'var(--primary)' },
              { l: 'Respuestas correctas', v: correctCount, max: Math.max(session.answers.length, 1), c: 'var(--sage)' },
              { l: 'Dificultad actual', v: Math.round(session.currentDifficulty), max: 10, c: 'var(--accent-2)' },
            ].map((d) => (
              <div key={d.l}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600 }}>{d.l}</span>
                  <span style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700 }}>{d.v}/{d.max}</span>
                </div>
                <ProgressBar value={d.v} max={d.max} color={d.c} height={6} />
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div style={{ background: 'var(--card-2)', border: '1px solid var(--card-ring)', borderRadius: 14, padding: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <InfoIcon />
            <p style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              El test ajusta la dificultad de cada pregunta según tus respuestas. Tomará entre 8 y 14 preguntas.
            </p>
          </div>
        </div>
      </aside>
    </div>
  )
}

function levelLabel(level: CEFRLevel) {
  const labels: Record<CEFRLevel, string> = {
    A1: 'Principiante', A2: 'Elemental', B1: 'Intermedio', B2: 'Independiente', C1: 'Avanzado', C2: 'Maestría',
  }
  return labels[level]
}

function ProgressBar({ value, max, color = 'var(--primary)', height = 8 }: { value: number; max: number; color?: string; height?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ height, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(58,47,74,0.08)' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999, transition: 'width 400ms ease', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 1, left: 1, right: 1, height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.35),transparent)', borderRadius: 999 }} />
      </div>
    </div>
  )
}

function CefrPill({ level }: { level: string }) {
  const bg = ['A1', 'A2'].includes(level) ? '#9bc998' : ['B1', 'B2'].includes(level) ? '#e8b961' : '#8b6db5'
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, background: bg, color: '#fff', fontWeight: 800, fontSize: 11, fontFamily: 'var(--f-sans)', letterSpacing: '0.06em' }}>{level}</span>
}

function SparklesIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><path d="M12 3l1.5 4 4 1.5-4 1.5L12 14l-1.5-4-4-1.5 4-1.5z"/></svg> }
function TargetIcon() { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4 }}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/></svg> }
function ClockIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg> }
function InfoIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg> }
