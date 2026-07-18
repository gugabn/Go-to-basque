'use client'

import { useEffect, useRef, useState } from 'react'
import type { FinanceGoal } from '@/lib/types'
import { cumulativeSeries, planValueAt, formatEur } from '@/lib/finance'
import type { Contribution } from '@/lib/types'

const H = 190
const PAD = { top: 14, right: 14, bottom: 26, left: 46 }

function shortEur(n: number): string {
  if (Math.abs(n) >= 1000) return `€${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return `€${Math.round(n)}`
}
function shortDate(t: number): string {
  return new Intl.DateTimeFormat('pt-PT', { month: 'short', year: '2-digit' }).format(new Date(t))
}

interface AreaChartProps {
  contributions: Contribution[]
  goal: FinanceGoal
}

export default function AreaChart({ contributions, goal }: AreaChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(340)
  const [active, setActive] = useState<number | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) setW(Math.max(260, e.contentRect.width))
    })
    ro.observe(el)
    setW(Math.max(260, el.clientWidth))
    return () => ro.disconnect()
  }, [])

  const pts = cumulativeSeries(contributions)

  if (pts.length < 2) {
    return (
      <div ref={wrapRef} style={{ height: H, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: '0 20px' }}>
        Regista alguns lançamentos para veres a tua evolução aqui.
      </div>
    )
  }

  const t0 = pts[0].t
  const t1 = pts[pts.length - 1].t
  const span = Math.max(1, t1 - t0)
  const maxVal = Math.max(...pts.map(p => p.value))
  const yMax = Math.max(1, maxVal) * 1.18

  const innerW = w - PAD.left - PAD.right
  const innerH = H - PAD.top - PAD.bottom
  const x = (t: number) => PAD.left + ((t - t0) / span) * innerW
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH

  const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const areaPath = `${linePath} L${x(t1).toFixed(1)},${(PAD.top + innerH).toFixed(1)} L${x(t0).toFixed(1)},${(PAD.top + innerH).toFixed(1)} Z`

  // linha do plano (só se já for relevante no domínio, senão fica no chão)
  const planEnd = planValueAt(goal, t1)
  const showPlan = planEnd > yMax * 0.05
  const planPath = showPlan
    ? `M${x(t0).toFixed(1)},${y(Math.min(yMax, planValueAt(goal, t0))).toFixed(1)} L${x(t1).toFixed(1)},${y(Math.min(yMax, planEnd)).toFixed(1)}`
    : ''

  const ticks = [0.25, 0.5, 0.75, 1].map(f => f * yMax)
  const last = pts[pts.length - 1]
  const act = active != null ? pts[active] : null

  function onMove(clientX: number) {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = clientX - rect.left
    const tt = t0 + ((px - PAD.left) / innerW) * span
    let best = 0, bd = Infinity
    pts.forEach((p, i) => { const d = Math.abs(p.t - tt); if (d < bd) { bd = d; best = i } })
    setActive(best)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%' }}>
      <svg width={w} height={H} style={{ display: 'block', touchAction: 'pan-y' }}
        onPointerMove={e => onMove(e.clientX)}
        onPointerDown={e => onMove(e.clientX)}
        onPointerLeave={() => setActive(null)}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F0824A" stopOpacity="0.42" />
            <stop offset="100%" stopColor="#F0824A" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="lineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#F0824A" />
            <stop offset="100%" stopColor="#F5B44C" />
          </linearGradient>
        </defs>

        {/* grelha + labels y */}
        {ticks.map((tv, i) => (
          <g key={i}>
            <line x1={PAD.left} y1={y(tv)} x2={w - PAD.right} y2={y(tv)} stroke="rgba(255,255,255,0.06)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(tv) + 3.5} textAnchor="end" fontSize="10" fill="var(--faint)">{shortEur(tv)}</text>
          </g>
        ))}

        {/* labels x */}
        <text x={PAD.left} y={H - 8} fontSize="10" fill="var(--faint)" textAnchor="start">{shortDate(t0)}</text>
        <text x={w - PAD.right} y={H - 8} fontSize="10" fill="var(--faint)" textAnchor="end">{shortDate(t1)}</text>

        {/* plano (referência tracejada) */}
        {showPlan && <path d={planPath} fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth={1.5} strokeDasharray="5 5" />}

        {/* área + linha */}
        <path d={areaPath} fill="url(#areaFill)" />
        <path d={linePath} fill="none" stroke="url(#lineStroke)" strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(240,130,74,0.4))' }} />

        {/* ponto final */}
        <circle cx={x(last.t)} cy={y(last.value)} r={5} fill="#F5B44C" stroke="#0B0B10" strokeWidth={2}
          style={{ filter: 'drop-shadow(0 0 8px rgba(245,180,76,0.8))' }} />

        {/* crosshair */}
        {act && (
          <g>
            <line x1={x(act.t)} y1={PAD.top} x2={x(act.t)} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.25)" strokeWidth={1} />
            <circle cx={x(act.t)} cy={y(act.value)} r={5} fill="#fff" stroke="#F0824A" strokeWidth={2} />
          </g>
        )}
      </svg>

      {act && (
        <div style={{
          position: 'absolute', top: 6,
          left: Math.min(Math.max(x(act.t) - 52, 4), w - 108),
          background: 'rgba(12,14,22,0.95)', border: '1px solid var(--border-strong)',
          borderRadius: 10, padding: '6px 10px', pointerEvents: 'none',
        }}>
          <div className="tnum" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{formatEur(act.value)}</div>
          <div style={{ fontSize: 10.5, color: 'var(--muted)' }}>{shortDate(act.t)}</div>
        </div>
      )}

      {showPlan && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 6, fontSize: 11, color: 'var(--muted)' }}>
          <Legend swatch="url" label="Poupado" />
          <Legend swatch="dash" label="Plano" />
        </div>
      )}
    </div>
  )
}

function Legend({ swatch, label }: { swatch: 'url' | 'dash'; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      {swatch === 'url'
        ? <span style={{ width: 14, height: 4, borderRadius: 2, background: 'linear-gradient(90deg,#F0824A,#F5B44C)' }} />
        : <span style={{ width: 14, height: 0, borderTop: '2px dashed rgba(255,255,255,0.5)' }} />}
      {label}
    </span>
  )
}
