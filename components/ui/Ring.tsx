'use client'

import { useEffect, useState } from 'react'
import CountUp from './CountUp'

interface RingProps {
  progress: number      // 0..1
  size?: number
  stroke?: number
  centerLabel?: string  // texto pequeno por baixo (ex.: "da meta")
}

export default function Ring({ progress, size = 168, stroke = 14, centerLabel }: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const target = Math.min(1, Math.max(0, progress))

  // desenha de 0 até ao valor ao montar (e reanima quando muda)
  const [p, setP] = useState(0)
  useEffect(() => {
    const reduce = typeof window !== 'undefined'
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setP(target); return }
    setP(0)
    const id = requestAnimationFrame(() => setP(target))
    return () => cancelAnimationFrame(id)
  }, [target])

  const offset = c * (1 - p)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0824A" />
            <stop offset="100%" stopColor="#F5B44C" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#ringGrad)" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1.15s cubic-bezier(0.32,0.72,0,1)',
            filter: 'drop-shadow(0 0 10px rgba(240,130,74,0.65))',
            animation: 'ringGlow 2.8s ease-in-out 1.3s infinite',
          }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="grad-text tnum" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: size * 0.24, fontWeight: 800, lineHeight: 1 }}>
          <CountUp value={Math.round(target * 100)} format={n => `${Math.round(n)}%`} duration={1150} />
        </span>
        {centerLabel && (
          <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.02em' }}>{centerLabel}</span>
        )}
      </div>
    </div>
  )
}
