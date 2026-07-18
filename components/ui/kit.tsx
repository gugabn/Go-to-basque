'use client'

import type { CSSProperties, ReactNode } from 'react'

/** Cartão de vidro. */
export function Card({ children, style, padding = 18 }: { children: ReactNode; style?: CSSProperties; padding?: number }) {
  return (
    <div className="glass" style={{ padding, ...style }}>
      {children}
    </div>
  )
}

/** Etiqueta de secção, pequena e em maiúsculas. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 12 }}>
      {children}
    </div>
  )
}

/** Bloco de estatística com fundo suave. */
export function Stat({
  label, value, sub, tone = 'var(--text)',
}: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="glass-soft" style={{ padding: '13px 15px' }}>
      <div style={{ fontSize: 11.5, color: 'var(--muted)' }}>{label}</div>
      <div className="tnum" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 21, fontWeight: 700, color: tone, marginTop: 3, lineHeight: 1.15 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--faint)', marginTop: 3 }}>{sub}</div>}
    </div>
  )
}

/** Pílula colorida. */
export function Pill({ children, color, bg }: { children: ReactNode; color: string; bg: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 15px', borderRadius: 999, backgroundColor: bg, color, fontSize: 13, fontWeight: 600 }}>
      {children}
    </span>
  )
}

/** Barra de progresso fina, com gradiente. */
export function Bar({ value, tone }: { value: number; tone?: string }) {
  const pct = Math.min(1, Math.max(0, value))
  return (
    <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct * 100}%`, height: '100%', borderRadius: 999,
          background: tone ?? 'var(--accent-grad)',
          boxShadow: '0 0 12px rgba(240,130,74,0.5)',
          transition: 'width 0.7s cubic-bezier(0.32,0.72,0,1)',
        }}
      />
    </div>
  )
}
