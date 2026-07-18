// ── Finanças ────────────────────────────────────────────────────────────────
// Rumo à Basque Culinary: poupar a anuidade nos anos de cruzeiros.

export type ContributionType = 'deposito' | 'levantamento'

export interface Contribution {
  id: string
  amount: number        // sempre positivo; o sinal vem do `type`
  type: ContributionType
  date: string          // ISO yyyy-mm-dd
  note?: string
  createdAt: number
}

export interface FinanceGoal {
  targetAmount: number   // total a poupar (ex.: 4 anuidades)
  startDate: string      // yyyy-mm-dd — quando começas a poupar
  targetDate: string     // yyyy-mm-dd — prazo final
  plannedMonthly: number // quanto planeias poupar por mês
  monthlySalary: number  // salário líquido mensal estimado (0 = por definir)
  currency: string       // símbolo (ex.: '€')
}

// Valores por defeito calculados a partir do plano 2026-2030:
// 4 anos de Basque Culinary × €11.445/ano = €45.780.
export const DEFAULT_GOAL: FinanceGoal = {
  targetAmount: 45780,
  startDate: '2027-07-01',
  targetDate: '2030-09-01',
  plannedMonthly: 1300,
  monthlySalary: 2000,
  currency: '€',
}

// ── Marcos / certificações ──────────────────────────────────────────────────
// Passos com custo e prazo antes de embarcar (STCW, ENG1, DELE B2, ...).

export interface Milestone {
  id: string
  title: string
  cost: number       // custo em €
  dueDate: string    // yyyy-mm-dd
  done: boolean
  note?: string
  createdAt: number
}

// Marcos por defeito, retirados do plano (certificações marítimas + idioma).
export const DEFAULT_MILESTONES: Milestone[] = [
  { id: 'm-passaporte', title: 'Passaporte + Seaman’s Book', cost: 50, dueDate: '2026-11-01', done: false, createdAt: 0 },
  { id: 'm-stcw', title: 'STCW Basic Safety Training', cost: 300, dueDate: '2026-08-01', done: false, createdAt: 0 },
  { id: 'm-cook', title: 'Ship’s Cook Certificate', cost: 500, dueDate: '2026-10-01', done: false, createdAt: 0 },
  { id: 'm-eng1', title: 'Exame Médico (ENG1)', cost: 200, dueDate: '2027-03-01', done: false, createdAt: 0 },
  { id: 'm-dele', title: 'DELE B2 (espanhol)', cost: 230, dueDate: '2029-05-01', done: false, note: 'Exames em maio e novembro — vitalício', createdAt: 0 },
]
