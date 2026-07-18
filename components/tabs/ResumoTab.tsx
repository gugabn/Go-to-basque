'use client'

import { useMemo } from 'react'
import type { Contribution, FinanceGoal } from '@/lib/types'
import {
  summarize, annuityTranches, requiredSavingsRate, formatPercent,
  formatEur, formatMonthYear, daysUntil,
} from '@/lib/finance'
import Ring from '@/components/ui/Ring'
import CountUp from '@/components/ui/CountUp'
import { Card, SectionLabel, Stat, Pill, Bar } from '@/components/ui/kit'

interface ResumoTabProps {
  contributions: Contribution[]
  goal: FinanceGoal
  onEditGoal: () => void
}

export default function ResumoTab({ contributions, goal, onEditGoal }: ResumoTabProps) {
  const summary = useMemo(() => summarize(contributions, goal), [contributions, goal])
  const tranches = useMemo(() => annuityTranches(summary.saved, goal), [summary.saved, goal])
  const savingsRate = requiredSavingsRate(summary.requiredMonthly, goal.monthlySalary)
  const startLabel = formatMonthYear(new Date(`${goal.startDate}T12:00:00`))

  return (
    <div className="stagger" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Herói */}
      <Card padding={22} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <Ring progress={summary.progress} centerLabel="da meta" />
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', letterSpacing: '0.02em' }}>Poupado</div>
          <div className="grad-shimmer tnum" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 40, fontWeight: 800, lineHeight: 1.05 }}>
            <CountUp value={summary.saved} format={formatEur} />
          </div>
          <div className="tnum" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>
            de {formatEur(summary.target)} · faltam {formatEur(summary.remaining)}
          </div>
        </div>
        <div style={{ marginTop: 8 }}><StatusPill summary={summary} /></div>
      </Card>

      {/* Contagem decrescente */}
      <Card padding={0}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1px 1fr' }}>
          <Countdown label="Até embarcar" days={daysUntil(goal.startDate)} embarkedText="A bordo" />
          <div style={{ background: 'var(--border)' }} />
          <Countdown label="Até à meta" days={daysUntil(goal.targetDate)} embarkedText="Meta a fechar" />
        </div>
      </Card>

      {/* Ritmo / fase */}
      <Card>
        <SectionLabel>Ritmo de poupança</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Stat
            label={summary.beforeStart ? 'Por mês a bordo' : 'Preciso por mês'}
            value={summary.reached ? '—' : formatEur(summary.requiredMonthly)}
            sub={
              summary.reached ? 'meta atingida 🎉'
                : summary.beforeStart ? `quando embarcares · ${startLabel}`
                : `${summary.monthsLeft} meses até ao prazo`
            }
          />
          <Stat
            label="Este mês"
            value={formatEur(summary.thisMonthSaved)}
            sub={summary.beforeStart ? 'adiantado' : 'poupado até agora'}
            tone={
              summary.reached ? 'var(--sage)'
                : summary.beforeStart
                  ? (summary.thisMonthSaved > 0 ? 'var(--sage)' : 'var(--text)')
                  : summary.thisMonthSaved >= summary.requiredMonthly ? 'var(--sage)'
                    : summary.thisMonthSaved > 0 ? 'var(--gold)' : 'var(--text)'
            }
          />
        </div>

        {!summary.reached && summary.beforeStart && (
          <div style={{ marginTop: 12, padding: '13px 15px', borderRadius: 14, background: 'rgba(63,217,162,0.10)', border: '1px solid rgba(63,217,162,0.22)' }}>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
              {summary.thisMonthSaved > 0
                ? `🎉 Este mês adiantaste ${formatEur(summary.thisMonthSaved)}. Ainda não embarcaste — tudo o que metes agora é adiantado.`
                : `💡 Só embarcas em ${startLabel}. Tudo o que meteres até lá é adiantado e baixa o que terás de poupar a bordo.`}
            </div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              Ao teu saldo atual, o ritmo a bordo já baixou para <strong style={{ color: 'var(--sage)' }}>{formatEur(summary.requiredMonthly)}/mês</strong>.
            </div>
          </div>
        )}

        {!summary.reached && !summary.beforeStart && summary.requiredMonthly > 0 && (
          <div style={{ marginTop: 12 }}>
            <Bar value={summary.requiredMonthly > 0 ? summary.thisMonthSaved / summary.requiredMonthly : 0}
                 tone={summary.thisMonthSaved >= summary.requiredMonthly ? 'var(--sage)' : undefined} />
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 7 }}>
              {summary.thisMonthSaved >= summary.requiredMonthly
                ? '✅ Já bateste o ritmo deste mês.'
                : `Faltam ${formatEur(Math.max(0, summary.requiredMonthly - summary.thisMonthSaved))} este mês para ficares no ritmo.`}
            </div>
          </div>
        )}

        {!summary.reached && savingsRate !== null && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 15px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>
              {summary.beforeStart ? 'Do salário a bordo' : 'Do teu salário estimado'}
            </span>
            <span className="tnum" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 19, fontWeight: 700, color: savingsRate > 1 ? 'var(--danger)' : savingsRate > 0.7 ? 'var(--gold)' : 'var(--sage)' }}>
              {formatPercent(savingsRate)}
            </span>
          </div>
        )}
      </Card>

      {/* Projeção */}
      <Card>
        <SectionLabel>Projeção</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          <Row label="Ao ritmo médio atual" value={summary.projectedFinish ? formatMonthYear(summary.projectedFinish) : 'sem dados ainda'} />
          <Row label="Média mensal" value={summary.avgMonthly > 0 ? formatEur(summary.avgMonthly) : '—'} />
          <Row label="Prazo do plano" value={formatMonthYear(new Date(`${goal.targetDate}T12:00:00`))} />
        </div>
        <button onClick={onEditGoal} style={ghostBtn}>Editar meta e datas</button>
      </Card>

      {/* Anuidades */}
      <Card>
        <SectionLabel>Anuidades cobertas</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {tranches.map(m => (
            <div key={m.label}
              style={{
                borderRadius: 14, padding: '12px 6px', textAlign: 'center',
                background: m.reached ? 'rgba(63,217,162,0.12)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${m.reached ? 'rgba(63,217,162,0.35)' : 'var(--border)'}`,
              }}>
              <Check reached={m.reached} />
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 6 }}>{m.label}</div>
              <div className="tnum" style={{ fontSize: 10, color: 'var(--faint)', marginTop: 1 }}>{formatEur(m.amount)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function StatusPill({ summary }: { summary: ReturnType<typeof summarize> }) {
  if (summary.reached) return <Pill color="var(--sage)" bg="rgba(63,217,162,0.14)">🎉 Meta atingida!</Pill>
  if (summary.ahead >= 0) return <Pill color="var(--sage)" bg="rgba(63,217,162,0.14)">▲ Adiantado {formatEur(summary.ahead)}</Pill>
  return <Pill color="var(--danger)" bg="rgba(255,107,107,0.12)">▼ Atrasado {formatEur(Math.abs(summary.ahead))}</Pill>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
      <span className="tnum" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function Check({ reached }: { reached: boolean }) {
  return (
    <div style={{
      width: 22, height: 22, margin: '0 auto', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: reached ? 'var(--sage)' : 'transparent',
      border: reached ? 'none' : '2px solid var(--border-strong)',
      boxShadow: reached ? '0 0 10px rgba(63,217,162,0.6)' : 'none',
    }}>
      {reached && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#04120C" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

function Countdown({ label, days, embarkedText }: { label: string; days: number; embarkedText: string }) {
  const past = days <= 0
  const big = past ? embarkedText : Math.abs(days) >= 60 ? `${Math.round(Math.abs(days) / 30.44)}` : `${days}`
  const unit = past ? '' : Math.abs(days) >= 60 ? 'meses' : days === 1 ? 'dia' : 'dias'
  return (
    <div style={{ padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--faint)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
      <div className="tnum" style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: past ? 18 : 26, fontWeight: 800, color: 'var(--text)', marginTop: 6, lineHeight: 1.05 }}>
        {big} {unit && <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>{unit}</span>}
      </div>
    </div>
  )
}

const ghostBtn: React.CSSProperties = {
  width: '100%', marginTop: 14, padding: '12px', borderRadius: 13,
  border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
