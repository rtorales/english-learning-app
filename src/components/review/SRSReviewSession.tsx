'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitSRSReview } from '@/actions/srs'
import { recordStudySession } from '@/actions/vocabulary'
import type { SRSItem } from '@/generated/prisma/client'
import type { SRSRating } from '@/types'
import Link from 'next/link'

interface SRSReviewSessionProps {
  items: SRSItem[]
}

const RATINGS: { rating: SRSRating; label: string; desc: string; interval: string; bg: string; shadow: string }[] = [
  { rating: 1, label: 'De nuevo', desc: 'No lo recordé',  interval: '1 min',  bg: 'var(--coral)',   shadow: '#b3635a' },
  { rating: 2, label: 'Difícil',  desc: 'Costó mucho',    interval: '6 min',  bg: '#d99966',       shadow: '#b37a4e' },
  { rating: 3, label: 'Bien',     desc: 'Recordé bien',   interval: '1d 8h',  bg: 'var(--sage)',   shadow: '#5b8a6e' },
  { rating: 4, label: 'Fácil',    desc: 'Sin esfuerzo',   interval: '4d',     bg: 'var(--primary)',shadow: 'var(--primary-2)' },
]

export function SRSReviewSession({ items }: SRSReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const sessionStart = useRef(Date.now())
  const correctRef = useRef(0)

  const currentItem = items[currentIndex]
  const progress = (currentIndex / items.length) * 100

  async function handleRating(rating: SRSRating) {
    if (isSubmitting) return
    setIsSubmitting(true)
    if (rating >= 3) correctRef.current++
    await submitSRSReview({ srsItemId: currentItem.id, rating })
    if (currentIndex + 1 >= items.length) {
      const durationSecs = Math.round((Date.now() - sessionStart.current) / 1000)
      void recordStudySession({
        type: 'srs_review',
        durationSecs,
        totalItems: items.length,
        correctItems: correctRef.current,
        xpEarned: items.length * 10,
      })
      setCompleted(true)
    } else {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
    setIsSubmitting(false)
  }

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ textAlign: 'center', padding: '48px 24px' }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', letterSpacing: '-0.02em', marginBottom: 8 }}>¡Sesión completada!</h2>
        <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 28 }}>Revisaste {items.length} tarjeta{items.length !== 1 ? 's' : ''} hoy. ¡Gran trabajo!</p>
        <Link href="/dashboard" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '0 24px', height: 50, borderRadius: 14,
          background: 'var(--primary)', color: 'var(--primary-ink)',
          fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15,
          textDecoration: 'none', boxShadow: '0 4px 0 var(--primary-2)',
          textTransform: 'uppercase', letterSpacing: '-0.01em',
        }}>
          Volver al inicio
        </Link>
      </motion.div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 720 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Link href="/dashboard" style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--card)', border: '1px solid var(--card-ring)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--ink-2)', textDecoration: 'none',
        }}>
          <ChevronLeftIcon />
        </Link>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sesión SRS · FSRS</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.015em' }}>Repaso espaciado — {items.length} tarjetas</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-3)', fontWeight: 600 }}>Tarjeta {currentIndex + 1} / {items.length}</span>
          <div style={{ width: 160 }}>
            <ProgressBar value={currentIndex + 1} max={items.length} />
          </div>
        </div>
      </div>

      {/* Card stack */}
      <div style={{ position: 'relative', marginBottom: 24 }}>
        {/* Shadow layers */}
        <div style={{ position: 'absolute', inset: '16px 24px 0', background: 'var(--card)', borderRadius: 24, border: '1px solid var(--card-ring)', opacity: 0.5 }} />
        <div style={{ position: 'absolute', inset: '8px 12px 0', background: 'var(--card)', borderRadius: 24, border: '1px solid var(--card-ring)', boxShadow: 'var(--sh-1)' }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentItem.id}-${showAnswer}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'relative',
              background: 'var(--card)',
              borderRadius: 24,
              border: '1px solid var(--card-ring)',
              boxShadow: 'var(--sh-3)',
              padding: '28px 32px 32px',
              minHeight: 340,
              display: 'flex', flexDirection: 'column',
            }}
          >
            {/* Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              <Pill bg="var(--primary-soft)" fg="var(--primary-2)">{currentItem.sector ?? 'General'}</Pill>
              <Pill bg="var(--bg-soft)" fg="var(--ink-3)">Vocabulario</Pill>
              <CefrPill level={currentIndex < 3 ? 'B1' : 'B2'} />
            </div>

            {/* Word / definition */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>EN</span>

              <h1 style={{
                fontFamily: 'var(--f-display)',
                fontWeight: 500, fontStyle: 'italic',
                fontSize: 52, letterSpacing: '-0.02em',
                color: 'var(--ink)', lineHeight: 1.05,
              }}>
                {currentItem.front}
              </h1>

              {!showAnswer ? (
                <button
                  onClick={() => setShowAnswer(true)}
                  style={{
                    marginTop: 20,
                    padding: '0 28px', height: 48,
                    background: 'var(--primary)', color: 'var(--primary-ink)',
                    border: 'none', borderRadius: 14,
                    fontFamily: 'var(--f-sans)', fontWeight: 700, fontSize: 15,
                    boxShadow: '0 4px 0 var(--primary-2)',
                    textTransform: 'uppercase', letterSpacing: '-0.01em',
                    cursor: 'pointer',
                    transition: 'transform 90ms ease, box-shadow 90ms ease',
                  }}
                  onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 1px 0 var(--primary-2)'; }}
                  onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 var(--primary-2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 0 var(--primary-2)'; }}
                >
                  Mostrar respuesta
                </button>
              ) : (
                <>
                  <div style={{ width: 60, height: 1, background: 'var(--card-line)', margin: '8px 0' }} />
                  <p style={{ fontSize: 20, color: 'var(--ink-2)', fontWeight: 500, maxWidth: 480 }}>
                    {currentItem.back}
                  </p>
                  {currentItem.context && (
                    <p style={{
                      fontSize: 14, color: 'var(--ink-3)', fontStyle: 'italic', maxWidth: 540,
                      background: 'var(--bg-soft)', padding: '10px 16px', borderRadius: 12, marginTop: 8,
                    }}>
                      "{currentItem.context}"
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rating buttons */}
      {showAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
            {RATINGS.map((r) => (
              <RatingButton
                key={r.rating}
                {...r}
                disabled={isSubmitting}
                onClick={() => handleRating(r.rating)}
              />
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
            Tu próxima revisión se calcula con FSRS según tu calificación · Atajos: 1 · 2 · 3 · 4
          </p>
        </motion.div>
      )}
    </div>
  )
}

function RatingButton({ label, desc, interval, bg, shadow, disabled, onClick }: {
  label: string; desc: string; interval: string; bg: string; shadow: string;
  disabled: boolean; onClick: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: '16px 12px',
        borderRadius: 16,
        background: bg,
        color: '#fff',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: `0 4px 0 ${shadow}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        fontFamily: 'var(--f-sans)',
        opacity: disabled ? 0.6 : 1,
        transition: 'transform 90ms ease, box-shadow 90ms ease',
      }}
      onMouseDown={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = `0 1px 0 ${shadow}`; }}}
      onMouseUp={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 0 ${shadow}`; }}}
      onMouseLeave={e => { if (!disabled) { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 0 ${shadow}`; }}}
    >
      <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{label}</span>
      <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>{desc}</span>
      <span style={{ marginTop: 4, padding: '3px 8px', background: 'rgba(255,255,255,0.22)', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>+{interval}</span>
    </button>
  )
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div style={{ height: 8, background: 'var(--bg-soft)', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(58,47,74,0.08)' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 999, transition: 'width 400ms ease', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 2, left: 2, right: 2, height: '40%', background: 'linear-gradient(180deg,rgba(255,255,255,0.35),transparent)', borderRadius: 999 }} />
      </div>
    </div>
  )
}

function Pill({ bg, fg, children }: { bg: string; fg: string; children: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', height: 26, padding: '0 10px', borderRadius: 999, background: bg, color: fg, fontSize: 12, fontWeight: 700, letterSpacing: '0.02em' }}>
      {children}
    </span>
  )
}

function CefrPill({ level }: { level: string }) {
  const bg = ['A1', 'A2'].includes(level) ? '#9bc998' : ['B1', 'B2'].includes(level) ? '#e8b961' : '#8b6db5'
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: 999, background: bg, color: '#fff', fontWeight: 800, fontSize: 11, fontFamily: 'var(--f-sans)', letterSpacing: '0.06em' }}>{level}</span>
}

function ChevronLeftIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
}
