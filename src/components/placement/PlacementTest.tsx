'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useActionState } from 'react'
import { submitPlacementTest } from '@/actions/placement'
import { createCATSession, selectNextDifficulty, shouldTerminate } from '@/lib/cat-engine'
import type { CATSession } from '@/lib/cat-engine'
import { SAMPLE_QUESTIONS } from './sample-questions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { SECTORS } from '@/types'
import type { ProfessionalSector } from '@/types'

type Phase = 'sector-select' | 'testing' | 'submitting'

export function PlacementTest() {
  const [phase, setPhase] = useState<Phase>('sector-select')
  const [sector, setSector] = useState<ProfessionalSector | null>(null)
  const [session, setSession] = useState<CATSession>(createCATSession())
  const [startTime, setStartTime] = useState(0)

  const currentQuestion = SAMPLE_QUESTIONS.find(
    (q) => Math.abs(q.difficulty - session.currentDifficulty) <= 1.5 &&
    !session.answers.some((a) => a.questionId === q.id)
  ) ?? SAMPLE_QUESTIONS[session.answers.length % SAMPLE_QUESTIONS.length]

  function handleSectorSelect(s: ProfessionalSector) {
    setSector(s)
    setPhase('testing')
    setStartTime(Date.now())
  }

  async function handleAnswer(selectedIndex: number) {
    if (!currentQuestion) return

    const timeMs = Date.now() - startTime
    const correct = selectedIndex === currentQuestion.correctIndex

    const newSession: CATSession = {
      ...session,
      answers: [
        ...session.answers,
        { questionId: currentQuestion.id, selectedIndex, correct, timeMs },
      ],
      currentDifficulty: selectNextDifficulty({
        ...session,
        answers: [...session.answers, { questionId: currentQuestion.id, selectedIndex, correct, timeMs }],
      }),
    }

    setSession(newSession)
    setStartTime(Date.now())

    if (shouldTerminate(newSession)) {
      setPhase('submitting')
      await submitPlacementTest({ sector: sector!, session: newSession })
    }
  }

  if (phase === 'sector-select') {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-violet-300">¿Cuál es tu sector profesional?</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {SECTORS.map((s) => (
            <Button
              key={s.value}
              variant="outline"
              className="justify-start h-auto py-3 border-slate-700 hover:border-violet-500 hover:bg-violet-950"
              onClick={() => handleSectorSelect(s.value)}
            >
              {s.label}
            </Button>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (phase === 'submitting') {
    return (
      <div className="text-center text-slate-400">
        <div className="text-4xl mb-4 animate-spin">⚙️</div>
        <p>Procesando resultados...</p>
      </div>
    )
  }

  const progress = (session.answers.length / 20) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>Pregunta {session.answers.length + 1} de 20</span>
        <span>Dificultad: {session.currentDifficulty.toFixed(1)}</span>
      </div>
      <Progress value={progress} className="h-2 bg-slate-800" />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-slate-900 border-slate-700">
            <CardHeader>
              <CardTitle className="text-lg text-slate-100 leading-relaxed">
                {currentQuestion?.text}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {currentQuestion?.options.map((option, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 border-slate-700 hover:border-violet-500 hover:bg-violet-950 text-slate-200"
                  onClick={() => handleAnswer(index)}
                >
                  <span className="mr-3 font-mono text-violet-400">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  {option}
                </Button>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
