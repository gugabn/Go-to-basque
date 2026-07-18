'use client'

import { useMemo } from 'react'
import type { Contribution, FinanceGoal } from '@/lib/types'
import { sourceMeta } from '@/lib/types'
import { summarize, formatEur, formatEurCents } from '@/lib/finance'
import { downloadContributionsCsv } from '@/lib/csv'
import { Card, SectionLabel, Stat } from '@/components/ui/kit'

interface MovimentosTabProps {
  contributions: Contribution[]
  goal: FinanceGoal
  onAdd: () => void
  onDeleteContribution: (id: string) => void
}

export default function MovimentosTab({ contributions, goal, onAdd, onDeleteContribution }: MovimentosTabProps) {
  const summary = useMemo(() => summarize(contributions, goal), [contributions, goal])
  const sorted = useMemo(
    () => [...contributions].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)),
    [contributions],
  )

  return (
    <div className="stagger" style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <Card>
        <SectionLabel>Saldo</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <Stat label="Poupado" value={formatEur(summary.saved)} sub={`${sorted.length} lançamento${sorted.length === 1 ? '' : 's'}`} />
          <Stat label="Este mês" value={formatEur(summary.thisMonthSaved)}
            sub="líquido"
            tone={summary.thisMonthSaved > 0 ? 'var(--sage)' : summary.thisMonthSaved < 0 ? 'var(--danger)' : 'var(--text)'} />
        </div>
        {sorted.length > 0 && (
          <button onClick={() => downloadContributionsCsv(sorted)} style={csvBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar CSV
          </button>
        )}
      </Card>

      {sorted.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '32px 22px' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💸</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>Ainda sem lançamentos</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4, lineHeight: 1.5 }}>
            Regista o teu primeiro depósito para começares a ver o progresso rumo à Basque.
          </div>
          <button onClick={onAdd} style={ctaBtn}>Registar depósito</button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sorted.map(c => (
            <ContributionRow key={c.id} c={c} onDelete={() => onDeleteContribution(c.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function ContributionRow({ c, onDelete }: { c: Contribution; onDelete: () => void }) {
  const isDeposit = c.type === 'deposito'
  const src = isDeposit && c.source ? sourceMeta(c.source) : null
  const dateLabel = new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(new Date(`${c.date}T12:00:00`))
  const accent = isDeposit ? 'var(--sage)' : 'var(--danger)'
  const accentBg = isDeposit ? 'rgba(63,217,162,0.14)' : 'rgba(255,107,107,0.13)'

  return (
    <div className="glass-soft" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: accentBg, color: accent }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {isDeposit ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {c.note || (isDeposit ? 'Depósito' : 'Levantamento')}
        </div>
        <div style={{ fontSize: 12, color: 'var(--faint)', marginTop: 1 }}>{src ? `${src.emoji} ${src.label} · ${dateLabel}` : dateLabel}</div>
      </div>
      <div className="tnum" style={{ fontSize: 15, fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
        {isDeposit ? '+' : '−'}{formatEurCents(c.amount)}
      </div>
      <button onClick={onDelete} aria-label="Eliminar"
        style={{ width: 34, height: 34, minWidth: 34, borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--danger)', flexShrink: 0 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  )
}

const ctaBtn: React.CSSProperties = {
  marginTop: 16, padding: '12px 22px', borderRadius: 13, border: 'none',
  background: 'var(--accent-grad)', color: '#0B0B10', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', boxShadow: 'var(--glow-primary)',
}

const csvBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  width: '100%', marginTop: 12, padding: '11px', borderRadius: 12,
  border: '1px solid var(--border-strong)', background: 'rgba(255,255,255,0.05)',
  color: 'var(--text)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
}
