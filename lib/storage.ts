import type { Contribution, FinanceGoal, Milestone } from './types'
import { DEFAULT_GOAL, DEFAULT_MILESTONES } from './types'

const isBrowser = typeof window !== 'undefined'

// ── Migração do ChefBook ──────────────────────────────────────────────────────
// As finanças viveram como separador do ChefBook, sob chaves `chefbook_*`.
// Se as apps partilharem a mesma origem (ex.: localhost:3000 ou o mesmo
// domínio), importa uma única vez os dados antigos para as chaves novas.
// Por-chave e não-destrutivo: só copia se a chave nova ainda não existir,
// por isso nunca sobrescreve dados já criados no Rumo à Basque.

const LEGACY_MAP: ReadonlyArray<readonly [newKey: string, oldKey: string]> = [
  ['rumobasque_contributions', 'chefbook_contributions'],
  ['rumobasque_goal', 'chefbook_finance_goal'],
  ['rumobasque_milestones', 'chefbook_milestones'],
]

export function migrateLegacyData(): void {
  if (!isBrowser) return
  try {
    for (const [newKey, oldKey] of LEGACY_MAP) {
      if (localStorage.getItem(newKey) === null) {
        const legacy = localStorage.getItem(oldKey)
        if (legacy !== null) localStorage.setItem(newKey, legacy)
      }
    }
  } catch {
    // localStorage indisponível/bloqueado — segue com os dados que houver.
  }
}

// ── Contribuições ─────────────────────────────────────────────────────────────

export function getContributions(): Contribution[] {
  if (!isBrowser) return []
  try {
    const raw = localStorage.getItem('rumobasque_contributions')
    return raw ? (JSON.parse(raw) as Contribution[]) : []
  } catch {
    return []
  }
}

export function saveContributions(contributions: Contribution[]): void {
  if (!isBrowser) return
  localStorage.setItem('rumobasque_contributions', JSON.stringify(contributions))
}

// ── Meta ──────────────────────────────────────────────────────────────────────

export function getFinanceGoal(): FinanceGoal {
  if (!isBrowser) return DEFAULT_GOAL
  try {
    const raw = localStorage.getItem('rumobasque_goal')
    // Fundir com os defaults para tolerar chaves em falta em versões futuras.
    return raw ? { ...DEFAULT_GOAL, ...(JSON.parse(raw) as Partial<FinanceGoal>) } : DEFAULT_GOAL
  } catch {
    return DEFAULT_GOAL
  }
}

export function saveFinanceGoal(goal: FinanceGoal): void {
  if (!isBrowser) return
  localStorage.setItem('rumobasque_goal', JSON.stringify(goal))
}

// ── Marcos / certificações ────────────────────────────────────────────────────

export function getMilestones(): Milestone[] {
  if (!isBrowser) return DEFAULT_MILESTONES
  try {
    const raw = localStorage.getItem('rumobasque_milestones')
    // Chave ausente = primeira utilização → semear os marcos do plano.
    // Um array vazio guardado (o utilizador apagou tudo) é respeitado.
    return raw === null ? DEFAULT_MILESTONES : (JSON.parse(raw) as Milestone[])
  } catch {
    return DEFAULT_MILESTONES
  }
}

export function saveMilestones(milestones: Milestone[]): void {
  if (!isBrowser) return
  localStorage.setItem('rumobasque_milestones', JSON.stringify(milestones))
}
