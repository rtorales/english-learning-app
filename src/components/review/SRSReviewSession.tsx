'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { submitSRSReview } from '@/actions/srs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { SRSItem } from '@/generated/prisma/client'
import type { SRSRating } from '@/types'

interface SRSReviewSessionProps {
  items: SRSItem[]
}

const RATINGS: { rating: SRSRating; label: string; color: string; emoji: string }[] = [
  { rating: 1, label: 'Otra vez', color: 'bg-red-900 hover:bg-red-800 border-red-700', emoji: '🔁' },
  { rating: 2, label: 'Difícil', color: 'bg-orange-900 hover:bg-orange-800 border-orange-700', emoji: '😓' },
  { rating: 3, label: 'Bien', color: 'bg-green-900 hover:bg-green-800 border-green-700', emoji: '👍' },
  { rating: 4, label: 'Fácil', color: 'bg-blue-900 hover:bg-blue-800 border-blue-700', emoji: '🚀' },
]

export function SRSReviewSession({ items }: SRSReviewSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentItem = items[currentIndex]
  const progress = (currentIndex / items.length) * 100

  async function handleRating(rating: SRSRating) {
    if (isSubmitting) return
    setIsSubmitting(true)

    await submitSRSReview({ srsItemId: currentItem.id, rating })

    if (currentIndex + 1 >= items.length) {
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
        className="text-center"
      >
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-violet-400 mb-2">¡Sesión completada!</h2>
        <p className="text-slate-400">Revisaste {items.length} tarjetas hoy.</p>
      </motion.div>
    )
  }

  return (
    <div className="w-full max-w-lg space-y-4">
      <div className="flex justify-between text-sm text-slate-400">
        <span>{currentIndex + 1} / {items.length}</span>
        <Badge variant="secondary" className="bg-slate-800">
          {currentItem.sector ?? 'General'}
        </Badge>
      </div>
      <Progress value={progress} className="h-2 bg-slate-800" />

      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentItem.id}-${showAnswer}`}
          initial={{ opacity: 0, rotateY: -90 }}
          animate={{ opacity: 1, rotateY: 0 }}
          exit={{ opacity: 0, rotateY: 90 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-slate-900 border-slate-700 min-h-48">
            <CardHeader>
              <CardTitle className="text-center text-xl text-slate-100">
                {currentItem.front}
              </CardTitle>
            </CardHeader>
            {showAnswer && (
              <CardContent className="text-center">
                <div className="h-px bg-slate-700 mb-4" />
                <p className="text-violet-300 text-lg">{currentItem.back}</p>
                {currentItem.context && (
                  <p className="text-slate-500 text-sm mt-2 italic">{currentItem.context}</p>
                )}
              </CardContent>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {!showAnswer ? (
        <Button
          className="w-full bg-violet-700 hover:bg-violet-600"
          onClick={() => setShowAnswer(true)}
        >
          Mostrar respuesta
        </Button>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {RATINGS.map(({ rating, label, color, emoji }) => (
            <button
              key={rating}
              disabled={isSubmitting}
              onClick={() => handleRating(rating)}
              className={`${color} border rounded-lg py-3 flex flex-col items-center gap-1 text-xs font-medium transition-colors disabled:opacity-50`}
            >
              <span className="text-lg">{emoji}</span>
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
