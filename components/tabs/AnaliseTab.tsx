'use client'

import { useMemo, useState } from 'react'
import type { Contribution, FinanceGoal } from '@/lib/types'
import { summarize, monthlyStats, simulateFinish, formatEur, formatMonthYear } from '@/lib/finance'
import AreaChart from '@/components/ui/AreaChart'
import { Card, SectionLabel, Stat } from '@/components/ui/kit'

interface AnaliseTabProps {
  contributions: Contribution[]
  goal: FinanceGoal
}

export default function AnaliseTab({ contributions, goal }: AnaliseTabProps) {
  const summary = useMemo(() => summarize(contributions, goal), [contributions, goal])
  const mstats = useMemo(() => monthlyStats(contributions), [contributions])

  return (
    <div className="stagger" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Evolução */}
      <Card>
        <SectionLabel>Evolução da poupança</SectionLabel>
        <AreaChart contributions={contributions} goal={goal} />
      </Card>

      {/* Mensal */}
      <Card>
        <SectionLabel>Por mês</SectionLabel>
        <MonthlyBars stats={mstats} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 14 }}>
          <Stat label="Melhor mês" value={mstats.best ? formatEur(mstats.best.net) : '—'} sub={mstats.best?.label ?? ''} tone="var(--sage)" />
          <Stat label="Média/mês" value={mstats.buckets.length ? formatEur(mstats.avg) : '—'} sub="com atividade" />
          <Stat label="Sequência" value={`${mstats.streak}`} sub={mstats.streak === 1 ? 'mês a poupar' : 'meses a poupar'} tone={mstats.streak > 0 ? 'var(--gold)' : 'var(--text)'} />
        </div>
      </Card>

      {/* Simulador */}
      <Simulator remaining={summary.remaining} goal={goal} reached={summary.reached} defaultMonthly={Math.round(summary.requiredMonthly || goal.plannedMonthly || 500)} />
    </div>
  )
}

// ── Barras mensais ────────────────────────────────────────────────────────────

function MonthlyBars({ stats }: { stats: ReturnType<typeof monthlyStats> }) {
  const buckets = stats.buckets
  if (buckets.length === 0) {
    return <div style={{ height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontSize: 13 }}>Ainda sem meses registados.</div>
  }
  const maxAbs = Math.max(...buckets.map(b => Math.abs(b.net)), 1)
  const BAR_H = 92
  const isBest = (k: string) => stats.best?.key === k

  return (
    <div className="scrollbar-hide" style={{ overflowX: 'auto', display: 'flex', gap: 10, alignItems: 'flex-end', paddingBottom: 4 }}>
      {buckets.map(b => {
        const h = Math.max(4, (Math.abs(b.net) / maxAbs) * BAR_H)
        const pos = b.net >= 0
        return (
          <div key={b.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 34 }}>
            <div className="tnum" style={{ fontSize: 10, color: 'var(--muted)', whiteSpace: 'nowrap' }}>{formatEur(b.net)}</div>
            <div style={{ height: BAR_H, display: 'flex', alignItems: 'flex-end' }}>
              <div style={{
                width: 26, height: h, borderRadius: 8,
                background: pos ? 'linear-gradient(180deg,#F5B44C,#F0824A)' : 'linear-gradient(180deg,#FF8A8A,#FF6B6B)',
                boxShadow: isBest(b.key) ? '0 0 14px rgba(245,180,76,0.75)' : 'none',
                outline: isBest(b.key) ? '1px solid rgba(245,180,76,0.6)' : 'none',
              }} />
            </div>
            <div style={{ fontSize: 10.5, color: 'var(--faint)', textTransform: 'capitalize' }}>{b.label.replace('.', '')}</div>
          </div>
        )
      })}
    </div>
  )
}

// ── Simulador "e se…" ─────────────────────────────────────────────────────────

function Simulator({ remaining, goal, reached, defaultMonthly }: {
  remaining: number; goal: FinanceGoal; reached: boolean; defaultMonthly: number
}) {
  const [monthly, setMonthly] = useState(Math.min(3000, Math.max(100, defaultMonthly)))
  const finish = simulateFinish(remaining, monthly)
  const deadline = new Date(`${goal.targetDate}T12:00:00`)
  const onTime = finish ? finish.getTime() <= deadline.getTime() : false
  const monthsDiff = finish ? Math.round((deadline.getTime() - finish.getTime()) / (1000 * 60 * 60 * 24 * 30.44)) : 0

  return (
    <Card>
      <SectionLabel>Simulador · e se poupar…</SectionLabel>

      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span className="tnum grad-text" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 30, fontWeight: 800 }}>{formatEur(monthly)}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>por mês</span>
      </div>

      <input
        type="range" min={100} max={3000} step={50} value={monthly}
        onChange={e => setMonthly(Number(e.target.value))}
        aria-label="Poupança mensal"
        style={{ width: '100%', marginTop: 10, accentColor: '#F0824A', height: 28 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--faint)', marginTop: -2 }}>
        <span>€100</span><span>€3.000</span>
      </div>

      <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 14, background: reached ? 'rgba(63,217,162,0.12)' : onTime ? 'rgba(63,217,162,0.10)' : 'rgba(255,107,107,0.10)', border: `1px solid ${reached || onTime ? 'rgba(63,217,162,0.28)' : 'rgba(255,107,107,0.28)'}` }}>
        {reached ? (
          <div style={{ fontSize: 14, color: 'var(--sage)', fontWeight: 600 }}>🎉 Meta já atingida!</div>
        ) : (
          <>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Atinges a meta em</div>
            <div className="tnum" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 24, fontWeight: 800, color: 'var(--text)', marginTop: 2, textTransform: 'capitalize' }}>
              {finish ? formatMonthYear(finish) : '—'}
            </div>
            <div style={{ fontSize: 12.5, color: onTime ? 'var(--sage)' : 'var(--danger)', marginTop: 4, fontWeight: 600 }}>
              {onTime
                ? `▲ ${Math.abs(monthsDiff)} ${Math.abs(monthsDiff) === 1 ? 'mês' : 'meses'} antes do prazo (${formatMonthYear(deadline)})`
                : `▼ ${Math.abs(monthsDiff)} ${Math.abs(monthsDiff) === 1 ? 'mês' : 'meses'} depois do prazo (${formatMonthYear(deadline)})`}
            </div>
          </>
        )}
      </div>
    </Card>
  )
}
