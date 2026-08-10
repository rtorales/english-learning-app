'use client'

import { useCallback, useEffect, useRef } from 'react'

// El reloj se lee acá, en el ámbito del módulo. Mantener `Date.now()` fuera del
// cuerpo de los componentes es lo que permite que el render siga siendo puro:
// dos renders con el mismo estado tienen que dar el mismo resultado.
function readClock(): number {
  return Date.now()
}

export interface SessionTimer {
  /** (Re)arranca el cronómetro. Se dispara solo al montar. */
  start: () => void
  /** Segundos transcurridos desde `start()`. 0 si nunca arrancó. */
  elapsedSecs: () => number
  /** Milisegundos desde el `lap()` anterior (o desde `start()`), y reinicia el parcial. */
  lap: () => number
}

/**
 * Cronómetro para sesiones de estudio: cuánto duró una lección, un repaso SRS,
 * o cada pregunta del test de nivelación.
 */
export function useSessionTimer(): SessionTimer {
  const startedAt = useRef<number | null>(null)
  const lastLapAt = useRef<number | null>(null)

  const start = useCallback(() => {
    const now = readClock()
    startedAt.current = now
    lastLapAt.current = now
  }, [])

  const elapsedSecs = useCallback(() => {
    if (startedAt.current === null) return 0
    return Math.round((readClock() - startedAt.current) / 1000)
  }, [])

  const lap = useCallback(() => {
    const now = readClock()
    const since = lastLapAt.current ?? now
    lastLapAt.current = now
    return now - since
  }, [])

  useEffect(() => {
    if (startedAt.current === null) start()
  }, [start])

  return { start, elapsedSecs, lap }
}
