'use client'

import { useMemo } from 'react'
import type { Milestone, FinanceGoal } from '@/lib/types'
import { summarizeMilestones, daysUntil, formatDay, formatEur, formatMonthYear } from '@/lib/finance'
import { Card, SectionLabel, Stat, Bar } from '@/components/ui/kit'

interface MarcosTabProps {
  milestones: Milestone[]
  goal: FinanceGoal
  onAddMilestone: () => void
  onEditMilestone: (m: Milestone) => void
  onToggleMilestone: (id: string) => void
  onDeleteMilestone: (id: string) => void
}

type TLItem =
  | { kind: 'embark'; date: string }
  | { kind: 'milestone'; date: string; m: Milestone }

export default function MarcosTab({
  milestones, goal, onAddMilestone, onEditMilestone, onToggleMilestone, onDeleteMilestone,
}: MarcosTabProps) {
  const stats = useMemo(() => summarizeMilestones(milestones), [milestones])
  const doneRatio = stats.totalCount > 0 ? stats.doneCount / stats.totalCount : 0

  const items = useMemo<TLItem[]>(() => {
    const list: TLItem[] = milestones.map(m => ({ kind: 'milestone', date: m.dueDate, m }))
    list.push({ kind: 'embark', date: goal.startDate })
    return list.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
  }, [milestones, goal.startDate])

  return (
    <div className="stagger" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <SectionLabel>Progresso</SectionLabel>
          <span className="tnum" style={{ fontSize: 12, color: 'var(--muted)', marginTop: -8 }}>{stats.doneCount}/{stats.totalCount} feitos</span>
        </div>
        <Bar value={doneRatio} tone={doneRatio >= 1 ? 'var(--sage)' : undefined} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14 }}>
          <Stat label="Custo total" value={formatEur(stats.total)} sub="todas as etapas" />
          <Stat label="Por pagar" value={formatEur(stats.pending)}
            sub={stats.nextDue ? `próximo: ${stats.nextDue.title}` : 'tudo tratado 🎉'}
            tone={stats.pending > 0 ? 'var(--gold)' : 'var(--sage)'} />
        </div>
      </Card>

      {/* Linha do tempo */}
      <Card>
        <SectionLabel>Linha do tempo</SectionLabel>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 2, background: 'var(--border)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {items.map((it, i) =>
              it.kind === 'embark'
                ? <EmbarkRow key={`emb-${i}`} date={it.date} />
                : <MilestoneRow key={it.m.id} m={it.m}
                    onToggle={() => onToggleMilestone(it.m.id)}
                    onEdit={() => onEditMilestone(it.m)}
                    onDelete={() => onDeleteMilestone(it.m.id)} />,
            )}
          </div>
        </div>
        <button onClick={onAddMilestone} style={addBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Adicionar marco
        </button>
      </Card>
    </div>
  )
}

function EmbarkRow({ date }: { date: string }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0' }}>
      <div style={{ width: 32, display: 'flex', justifyContent: 'center', flexShrink: 0, zIndex: 1 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)' }}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#0B0B10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" /><line x1="6" y1="17" x2="18" y2="17" />
          </svg>
        </div>
      </div>
      <div style={{ flex: 1, padding: '10px 14px', borderRadius: 12, background: 'rgba(240,130,74,0.10)', border: '1px solid rgba(240,130,74,0.28)' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>⚓ Embarque</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 1, textTransform: 'capitalize' }}>{formatMonthYear(new Date(`${date}T12:00:00`))}</div>
      </div>
    </div>
  )
}

function MilestoneRow({ m, onToggle, onEdit, onDelete }: {
  m: Milestone; onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  const days = daysUntil(m.dueDate)
  const overdue = !m.done && days < 0
  const soon = !m.done && days >= 0 && days <= 30

  let dateColor = 'var(--faint)'
  if (m.done) dateColor = 'var(--sage)'
  else if (overdue) dateColor = 'var(--danger)'
  else if (soon) dateColor = 'var(--gold)'

  let dateLabel = formatDay(m.dueDate)
  if (!m.done) {
    if (overdue) dateLabel += ` · ${Math.abs(days)}d atrasado`
    else if (days === 0) dateLabel += ' · hoje'
    else if (soon) dateLabel += ` · faltam ${days}d`
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', padding: '4px 0' }}>
      <div style={{ width: 32, display: 'flex', justifyContent: 'center', flexShrink: 0, zIndex: 1, paddingTop: 14 }}>
        <button onClick={onToggle} aria-label={m.done ? 'Marcar por fazer' : 'Marcar como feito'}
          style={{
            width: 26, height: 26, minWidth: 26, minHeight: 26, borderRadius: '50%', flexShrink: 0,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
            background: m.done ? 'var(--sage)' : 'var(--surface)',
            border: m.done ? 'none' : `2px solid ${overdue ? 'var(--danger)' : 'var(--border-strong)'}`,
            boxShadow: m.done ? '0 0 10px rgba(63,217,162,0.55)' : 'none',
          }}>
          {m.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#04120C" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        </button>
      </div>

      <div className="glass-soft" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: m.done ? 'var(--faint)' : 'var(--text)', textDecoration: m.done ? 'line-through' : 'none', lineHeight: 1.3 }}>{m.title}</div>
          <div style={{ fontSize: 12, color: dateColor, marginTop: 2, fontWeight: overdue || soon ? 600 : 400 }}>{dateLabel}</div>
        </div>
        <div className="tnum" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap' }}>{formatEur(m.cost)}</div>
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          <button onClick={onEdit} aria-label="Editar" style={iconBtn('var(--muted)')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button onClick={onDelete} aria-label="Eliminar" style={iconBtn('var(--danger)')}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

function iconBtn(color: string): React.CSSProperties {
  return {
    width: 32, height: 32, minWidth: 32, minHeight: 32, borderRadius: 9,
    border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color,
  }
}

const addBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', marginTop: 14, padding: '13px', borderRadius: 14,
  border: '1px dashed var(--border-strong)', background: 'rgba(255,255,255,0.03)',
  color: 'var(--text)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
}
