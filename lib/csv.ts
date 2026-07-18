import type { Contribution } from './types'
import { sourceMeta } from './types'

const isBrowser = typeof window !== 'undefined'

function esc(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** Constrói o CSV dos lançamentos (mais recentes primeiro). */
export function buildContributionsCsv(contributions: Contribution[]): string {
  const header = ['Data', 'Tipo', 'Fonte', 'Valor', 'Nota']
  const rows = [...contributions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt))
    .map(c => [
      c.date,
      c.type === 'deposito' ? 'Depósito' : 'Levantamento',
      c.source ? sourceMeta(c.source).label : '',
      (c.type === 'levantamento' ? -c.amount : c.amount).toFixed(2),
      c.note ?? '',
    ].map(x => esc(String(x))).join(','))
  return [header.join(','), ...rows].join('\n')
}

/** Desencadeia o download do CSV. */
export function downloadContributionsCsv(contributions: Contribution[]): void {
  if (!isBrowser) return
  const csv = buildContributionsCsv(contributions)
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const stamp = new Date().toISOString().slice(0, 10)
  const a = document.createElement('a')
  a.href = url
  a.download = `rumo-basque-lancamentos-${stamp}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
