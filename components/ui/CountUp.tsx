'use client'

import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  value: number
  format: (n: number) => string
  duration?: number
}

/** Anima um número de 0 (ou do valor anterior) até ao alvo, com easeOutCubic. */
export default function CountUp({ value, format, duration = 950 }: CountUpProps) {
  const [display, setDisplay] = useState(0)
  const fromRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = fromRef.current
    const to = value

    if (reduce || from === to) {
      setDisplay(to)
      fromRef.current = to
      return
    }

    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + (to - from) * eased)
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration])

  return <>{format(display)}</>
}
