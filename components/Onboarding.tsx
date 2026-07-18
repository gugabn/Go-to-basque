'use client'

import { useState } from 'react'
import type { FinanceGoal } from '@/lib/types'

interface OnboardingProps {
  initial: FinanceGoal
  onComplete: (goal: FinanceGoal) => void
}

const STEPS = 4

export default function Onboarding({ initial, onComplete }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const [target, setTarget] = useState(String(initial.targetAmount))
  const [startDate, setStartDate] = useState(initial.startDate)
  const [targetDate, setTargetDate] = useState(initial.targetDate)
  const [monthly, setMonthly] = useState(String(initial.plannedMonthly))
  const [salary, setSalary] = useState(String(initial.monthlySalary))

  const targetNum = parseFloat(target.replace(',', '.'))
  const stepValid =
    step === 0 ? true :
    step === 1 ? !isNaN(targetNum) && targetNum > 0 :
    step === 2 ? !!startDate && !!targetDate && startDate < targetDate :
    true

  const finish = () => {
    onComplete({
      ...initial,
      targetAmount: targetNum || initial.targetAmount,
      startDate, targetDate,
      plannedMonthly: parseFloat(monthly.replace(',', '.')) || 0,
      monthlySalary: parseFloat(salary.replace(',', '.')) || 0,
    })
  }

  const next = () => { if (step < STEPS - 1) setStep(step + 1); else finish() }
  const back = () => setStep(Math.max(0, step - 1))

  return (
    <div className="app-shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', padding: '0 20px', paddingTop: 'env(safe-area-inset-top)' }}>
      {/* progresso */}
      <div style={{ display: 'flex', gap: 6, padding: '22px 0 8px' }}>
        {Array.from({ length: STEPS }).map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= step ? 'var(--accent-grad)' : 'rgba(255,255,255,0.1)', boxShadow: i <= step ? '0 0 8px rgba(240,130,74,0.5)' : 'none', transition: 'all 0.3s' }} />
        ))}
      </div>

      <div key={step} className="tab-enter" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16, paddingBottom: 20 }}>
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: 22, margin: '0 auto 20px', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--glow-primary)' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#0B0B10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/></svg>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 30, fontWeight: 800, margin: 0 }}>
              Rumo à <span className="grad-text">Basque</span>
            </h1>
            <p style={{ fontSize: 15, color: 'var(--muted)', marginTop: 12, lineHeight: 1.6, maxWidth: 300, marginInline: 'auto' }}>
              Vamos configurar o teu plano de poupança até à Basque Culinary. Leva 30 segundos.
            </p>
          </div>
        )}

        {step === 1 && (
          <Field title="Qual é a tua meta?" hint="4 anuidades da Basque × €11.445 = €45.780. Ajusta ao teu caso.">
            <MoneyInput value={target} onChange={setTarget} autoFocus />
          </Field>
        )}

        {step === 2 && (
          <Field title="Quando embarcas e qual o prazo?" hint="O embarque marca o início da poupança a sério. Até lá, tudo é adiantado.">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <Label>Embarque</Label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <Label>Prazo (meta)</Label>
                <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={inputStyle} />
              </div>
            </div>
          </Field>
        )}

        {step === 3 && (
          <Field title="E o dinheiro?" hint="Serve para calcular quanto precisas de poupar e que % do salário representa. Podes mudar depois.">
            <Label>Salário mensal estimado (a bordo)</Label>
            <MoneyInput value={salary} onChange={setSalary} />
            <div style={{ height: 14 }} />
            <Label>Poupança mensal planeada</Label>
            <MoneyInput value={monthly} onChange={setMonthly} />
          </Field>
        )}
      </div>

      {/* ações */}
      <div style={{ display: 'flex', gap: 10, paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}>
        {step > 0 && (
          <button onClick={back} style={{ ...btnBase, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-strong)', color: 'var(--text)', flex: '0 0 auto', paddingInline: 22 }}>Voltar</button>
        )}
        <button onClick={next} disabled={!stepValid}
          style={{ ...btnBase, flex: 1, background: stepValid ? 'var(--accent-grad)' : 'rgba(255,255,255,0.08)', color: stepValid ? '#0B0B10' : 'var(--faint)', boxShadow: stepValid ? 'var(--glow-primary)' : 'none', cursor: stepValid ? 'pointer' : 'not-allowed' }}>
          {step === 0 ? 'Começar' : step === STEPS - 1 ? 'Concluir' : 'Continuar'}
        </button>
      </div>
    </div>
  )
}

function Field({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 24, fontWeight: 700, margin: '0 0 8px', textWrap: 'balance' as const }}>{title}</h2>
      <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 20px', lineHeight: 1.55 }}>{hint}</p>
      {children}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--muted)', marginBottom: 6 }}>{children}</div>
}

function MoneyInput({ value, onChange, autoFocus }: { value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>€</span>
      <input type="number" inputMode="decimal" min="0" value={value} onChange={e => onChange(e.target.value)} autoFocus={autoFocus}
        style={{ ...inputStyle, paddingLeft: 40, fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display), sans-serif' }} />
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '13px 14px', borderRadius: 12,
  border: '1px solid var(--border-strong)', background: 'var(--surface)',
  fontSize: 16, color: 'var(--text)', outline: 'none', fontFamily: 'inherit',
}

const btnBase: React.CSSProperties = {
  padding: '15px', borderRadius: 14, border: 'none',
  fontSize: 16, fontWeight: 700, cursor: 'pointer',
}
