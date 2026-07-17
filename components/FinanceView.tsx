'use client'

import { useMemo } from 'react'
import type { Contribution, FinanceGoal, Milestone } from '@/lib/types'
import {
  summarize,
  annuityTranches,
  summarizeMilestones,
  requiredSavingsRate,
  formatPercent,
  daysUntil,
  formatDay,
  formatEur,
  formatEurCents,
  formatMonthYear,
} from '@/lib/finance'

interface FinanceViewProps {
  contributions: Contribution[]
  goal: FinanceGoal
  milestones: Milestone[]
  onEditGoal: () => void
  onDeleteContribution: (id: string) => void
  onAddMilestone: () => void
  onEditMilestone: (milestone: Milestone) => void
  onToggleMilestone: (id: string) => void
  onDeleteMilestone: (id: string) => void
}

export default function FinanceView({
  contributions,
  goal,
  milestones,
  onEditGoal,
  onDeleteContribution,
  onAddMilestone,
  onEditMilestone,
  onToggleMilestone,
  onDeleteMilestone,
}: FinanceViewProps) {
  const summary = useMemo(() => summarize(contributions, goal), [contributions, goal])
  const tranches = useMemo(() => annuityTranches(summary.saved, goal), [summary.saved, goal])
  const mStats = useMemo(() => summarizeMilestones(milestones), [milestones])
  const savingsRate = requiredSavingsRate(summary.requiredMonthly, goal.monthlySalary)

  const sortedMilestones = useMemo(
    () => [...milestones].sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0)),
    [milestones],
  )

  const sorted = useMemo(
    () => [...contributions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)),
    [contributions],
  )

  return (
    <div style={{ padding: '8px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Painel principal */}
      <section
        style={{
          backgroundColor: 'var(--surface)',
          borderRadius: 18,
          border: '1px solid var(--border)',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
        }}
      >
        <ProgressRing progress={summary.progress} />

        <div style={{ marginTop: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>Poupado</div>
          <div
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 30,
              fontWeight: 700,
              color: 'var(--text)',
              lineHeight: 1.1,
            }}
          >
            {formatEur(summary.saved)}
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
            de {formatEur(summary.target)} · faltam {formatEur(summary.remaining)}
          </div>
        </div>

        <StatusPill summary={summary} />
      </section>

      {/* Ritmo */}
      <section style={cardStyle}>
        <CardTitle>Ritmo de poupança</CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Stat
            label="Preciso por mês"
            value={summary.reached ? '—' : formatEur(summary.requiredMonthly)}
            sub={summary.reached ? 'meta atingida 🎉' : `${summary.monthsLeft} meses até ao prazo`}
          />
          <Stat
            label="Este mês"
            value={formatEur(summary.thisMonthSaved)}
            sub="poupado até agora"
            color={
              summary.reached || summary.thisMonthSaved >= summary.requiredMonthly
                ? 'var(--sage)'
                : summary.thisMonthSaved > 0 ? 'var(--gold)' : 'var(--muted)'
            }
          />
        </div>

        {/* Barra: este mês vs necessário */}
        {!summary.reached && summary.requiredMonthly > 0 && (
          <div style={{ marginTop: 14 }}>
            <MiniBar
              value={summary.thisMonthSaved}
              target={summary.requiredMonthly}
            />
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
              {summary.thisMonthSaved >= summary.requiredMonthly
                ? '✅ Já bateste o ritmo deste mês.'
                : `Faltam ${formatEur(Math.max(0, summary.requiredMonthly - summary.thisMonthSaved))} este mês para ficares no ritmo.`}
            </div>
          </div>
        )}

        {/* Meta por salário */}
        {!summary.reached && savingsRate !== null && (
          <SalaryInsight rate={savingsRate} salary={goal.monthlySalary} required={summary.requiredMonthly} />
        )}
      </section>

      {/* Projeção */}
      <section style={cardStyle}>
        <CardTitle>Projeção</CardTitle>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Row
            label="Ao ritmo médio atual"
            value={
              summary.projectedFinish
                ? formatMonthYear(summary.projectedFinish)
                : 'sem dados ainda'
            }
          />
          <Row
            label="Média mensal"
            value={summary.avgMonthly > 0 ? formatEur(summary.avgMonthly) : '—'}
          />
          <Row
            label="Prazo do plano"
            value={formatMonthYear(new Date(`${goal.targetDate}T12:00:00`))}
          />
        </div>
        <ProjectionVerdict summary={summary} goal={goal} />
      </section>

      {/* Sub-metas por ano */}
      <section style={cardStyle}>
        <CardTitle>Anuidades cobertas</CardTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {tranches.map(m => (
            <div
              key={m.label}
              style={{
                borderRadius: 12,
                border: `1px solid ${m.reached ? 'var(--sage)' : 'var(--border)'}`,
                backgroundColor: m.reached ? 'rgba(122,158,126,0.12)' : 'var(--surface2)',
                padding: '10px 6px',
                textAlign: 'center',
              }}
            >
              <MilestoneMark reached={m.reached} />
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 4 }}>
                {m.label}
              </div>
              <div style={{ fontSize: 10, color: 'var(--muted)' }}>{formatEur(m.amount)}</div>
            </div>
          ))}
        </div>
        <button onClick={onEditGoal} style={editBtnStyle}>
          Editar meta e datas
        </button>
      </section>

      {/* Marcos / certificações */}
      <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <CardTitle>Marcos e certificações</CardTitle>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>
            {mStats.doneCount}/{mStats.totalCount} feitos
          </span>
        </div>

        {/* Resumo de custos */}
        <div style={{ padding: '0 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Stat label="Custo total" value={formatEur(mStats.total)} sub="todas as etapas" />
          <Stat
            label="Por pagar"
            value={formatEur(mStats.pending)}
            sub={mStats.nextDue ? `próximo: ${mStats.nextDue.title}` : 'tudo tratado 🎉'}
            color={mStats.pending > 0 ? 'var(--gold)' : 'var(--sage)'}
          />
        </div>

        {sortedMilestones.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {sortedMilestones.map((m, i) => (
              <MilestoneRow
                key={m.id}
                milestone={m}
                isLast={i === sortedMilestones.length - 1}
                onToggle={() => onToggleMilestone(m.id)}
                onEdit={() => onEditMilestone(m)}
                onDelete={() => onDeleteMilestone(m.id)}
              />
            ))}
          </div>
        )}

        <div style={{ padding: '12px 16px 16px' }}>
          <button onClick={onAddMilestone} style={editBtnStyle}>
            + Adicionar marco
          </button>
        </div>
      </section>

      {/* Lançamentos */}
      <section style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 16px 8px' }}>
          <CardTitle>Lançamentos</CardTitle>
        </div>
        {sorted.length === 0 ? (
          <div style={{ padding: '8px 16px 20px', fontSize: 13, color: 'var(--muted)' }}>
            Ainda sem lançamentos. Toca no <strong style={{ color: 'var(--text)' }}>+</strong> lá em cima
            para registar o teu primeiro depósito.
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {sorted.map((c, i) => (
              <ContributionRow
                key={c.id}
                contribution={c}
                isLast={i === sorted.length - 1}
                onDelete={() => onDeleteContribution(c.id)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function MilestoneMark({ reached }: { reached: boolean }) {
  return (
    <div
      style={{
        width: 22,
        height: 22,
        margin: '0 auto',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: reached ? 'var(--sage)' : 'transparent',
        border: reached ? 'none' : '2px solid var(--border)',
      }}
    >
      {reached && (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  )
}

// ── Anel de progresso ────────────────────────────────────────────────────────

function ProgressRing({ progress }: { progress: number }) {
  const size = 132
  const stroke = 12
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference * (1 - progress)
  const pct = Math.round(progress * 100)

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--surface2)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.32,0.72,0,1)' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: 30,
            fontWeight: 700,
            color: 'var(--primary)',
            lineHeight: 1,
          }}
        >
          {pct}%
        </span>
        <span style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>da meta</span>
      </div>
    </div>
  )
}

// ── Estado (adiantado / no ritmo / atrasado) ─────────────────────────────────

function StatusPill({ summary }: { summary: ReturnType<typeof summarize> }) {
  let label: string
  let bg: string
  let color: string

  if (summary.reached) {
    label = '🎉 Meta atingida!'
    bg = 'rgba(122,158,126,0.15)'
    color = 'var(--sage)'
  } else if (summary.ahead >= 0) {
    label = `Adiantado ${formatEur(summary.ahead)}`
    bg = 'rgba(122,158,126,0.15)'
    color = 'var(--sage)'
  } else {
    label = `Atrasado ${formatEur(Math.abs(summary.ahead))}`
    bg = 'rgba(232,93,58,0.12)'
    color = '#E85D3A'
  }

  return (
    <div
      style={{
        marginTop: 12,
        padding: '7px 14px',
        borderRadius: 999,
        backgroundColor: bg,
        color,
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      {label}
    </div>
  )
}

function ProjectionVerdict({
  summary,
  goal,
}: {
  summary: ReturnType<typeof summarize>
  goal: FinanceGoal
}) {
  if (summary.reached) return null
  if (!summary.projectedFinish) {
    return (
      <div style={verdictStyle('var(--muted)', 'var(--surface2)')}>
        Regista alguns depósitos para veres a projeção da data de chegada.
      </div>
    )
  }
  const deadline = new Date(`${goal.targetDate}T12:00:00`)
  const onTime = summary.projectedFinish.getTime() <= deadline.getTime()
  return (
    <div
      style={verdictStyle(
        onTime ? 'var(--sage)' : '#E85D3A',
        onTime ? 'rgba(122,158,126,0.12)' : 'rgba(232,93,58,0.10)',
      )}
    >
      {onTime
        ? `👍 A este ritmo chegas à meta antes do prazo, em ${formatMonthYear(summary.projectedFinish)}.`
        : `⚠️ A este ritmo só chegas em ${formatMonthYear(summary.projectedFinish)} — depois do prazo. Sobe a poupança mensal.`}
    </div>
  )
}

function verdictStyle(color: string, bg: string): React.CSSProperties {
  return {
    marginTop: 12,
    padding: '10px 12px',
    borderRadius: 10,
    backgroundColor: bg,
    color,
    fontSize: 13,
    lineHeight: 1.45,
  }
}

// ── Lançamento individual ────────────────────────────────────────────────────

function ContributionRow({
  contribution,
  isLast,
  onDelete,
}: {
  contribution: Contribution
  isLast: boolean
  onDelete: () => void
}) {
  const isDeposit = contribution.type === 'deposito'
  const dateLabel = new Intl.DateTimeFormat('pt-PT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${contribution.date}T12:00:00`))

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: 12,
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDeposit ? 'rgba(122,158,126,0.15)' : 'rgba(232,93,58,0.12)',
          color: isDeposit ? 'var(--sage)' : '#E85D3A',
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {isDeposit ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3 }}>
          {contribution.note || (isDeposit ? 'Depósito' : 'Levantamento')}
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1 }}>{dateLabel}</div>
      </div>

      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: isDeposit ? 'var(--sage)' : '#E85D3A',
          whiteSpace: 'nowrap',
        }}
      >
        {isDeposit ? '+' : '−'}{formatEurCents(contribution.amount)}
      </div>

      <button
        onClick={onDelete}
        aria-label="Eliminar"
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: '1px solid var(--border)',
          backgroundColor: 'var(--surface)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#E85D3A',
          flexShrink: 0,
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
        </svg>
      </button>
    </div>
  )
}

// ── Meta por salário ─────────────────────────────────────────────────────────

function SalaryInsight({
  rate,
  salary,
  required,
}: {
  rate: number
  salary: number
  required: number
}) {
  const tough = rate > 1
  const heavy = rate > 0.7 && rate <= 1
  const color = tough ? '#E85D3A' : heavy ? 'var(--gold)' : 'var(--sage)'
  const bg = tough ? 'rgba(232,93,58,0.10)' : heavy ? 'rgba(232,168,56,0.12)' : 'rgba(122,158,126,0.12)'

  return (
    <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 12, backgroundColor: bg }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>Do teu salário estimado</span>
        <span style={{ fontSize: 20, fontWeight: 700, color }}>{formatPercent(rate)}</span>
      </div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, lineHeight: 1.45 }}>
        {tough
          ? `Precisas de ${formatEur(required)}/mês mas o salário estimado é ${formatEur(salary)}. Não chega — sobe o prazo, o salário ou baixa a meta.`
          : `Poupar ${formatEur(required)} dos ${formatEur(salary)} que ganhas por mês chega para bateres o ritmo.`}
      </div>
    </div>
  )
}

// ── Marco individual ─────────────────────────────────────────────────────────

function MilestoneRow({
  milestone,
  isLast,
  onToggle,
  onEdit,
  onDelete,
}: {
  milestone: Milestone
  isLast: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const days = daysUntil(milestone.dueDate)
  const overdue = !milestone.done && days < 0
  const soon = !milestone.done && days >= 0 && days <= 30

  let dateColor = 'var(--muted)'
  if (milestone.done) dateColor = 'var(--sage)'
  else if (overdue) dateColor = '#E85D3A'
  else if (soon) dateColor = 'var(--gold)'

  let dateLabel = formatDay(milestone.dueDate)
  if (!milestone.done) {
    if (overdue) dateLabel += ` · ${Math.abs(days)}d atrasado`
    else if (days === 0) dateLabel += ' · hoje'
    else if (soon) dateLabel += ` · faltam ${days}d`
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        gap: 12,
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-label={milestone.done ? 'Marcar por fazer' : 'Marcar como feito'}
        style={{
          width: 26,
          height: 26,
          minWidth: 26,
          minHeight: 26,
          borderRadius: '50%',
          flexShrink: 0,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          backgroundColor: milestone.done ? 'var(--sage)' : 'transparent',
          border: milestone.done ? 'none' : '2px solid var(--border)',
        }}
      >
        {milestone.done && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: milestone.done ? 'var(--muted)' : 'var(--text)',
            textDecoration: milestone.done ? 'line-through' : 'none',
            lineHeight: 1.3,
          }}
        >
          {milestone.title}
        </div>
        <div style={{ fontSize: 12, color: dateColor, marginTop: 1, fontWeight: overdue || soon ? 600 : 400 }}>
          {dateLabel}
        </div>
      </div>

      {/* Custo */}
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>
        {formatEur(milestone.cost)}
      </div>

      {/* Ações */}
      <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <button
          onClick={onEdit}
          aria-label="Editar"
          style={iconBtnStyle('var(--muted)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          aria-label="Eliminar"
          style={iconBtnStyle('#E85D3A')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </button>
      </div>
    </div>
  )
}

function iconBtnStyle(color: string): React.CSSProperties {
  return {
    width: 34,
    height: 34,
    minWidth: 34,
    minHeight: 34,
    borderRadius: 8,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color,
  }
}

// ── Blocos reutilizáveis ─────────────────────────────────────────────────────

function CardTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12 }}>
      {children}
    </div>
  )
}

function Stat({
  label,
  value,
  sub,
  color = 'var(--text)',
}: {
  label: string
  value: string
  sub?: string
  color?: string
}) {
  return (
    <div style={{ backgroundColor: 'var(--surface2)', borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color, marginTop: 2, lineHeight: 1.2 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

function MiniBar({ value, target }: { value: number; target: number }) {
  const pct = target > 0 ? Math.min(1, Math.max(0, value / target)) : 0
  const reached = value >= target
  return (
    <div style={{ height: 8, borderRadius: 999, backgroundColor: 'var(--surface2)', overflow: 'hidden' }}>
      <div
        style={{
          width: `${pct * 100}%`,
          height: '100%',
          borderRadius: 999,
          backgroundColor: reached ? 'var(--sage)' : 'var(--primary)',
          transition: 'width 0.5s cubic-bezier(0.32,0.72,0,1)',
        }}
      />
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--surface)',
  borderRadius: 16,
  border: '1px solid var(--border)',
  padding: 16,
}

const editBtnStyle: React.CSSProperties = {
  width: '100%',
  marginTop: 14,
  padding: '11px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface2)',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}
