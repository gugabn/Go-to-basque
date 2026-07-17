'use client'

import { useState, useEffect } from 'react'
import Sheet from '@/components/ui/Sheet'
import type { FinanceGoal } from '@/lib/types'

interface FinanceGoalModalProps {
  isOpen: boolean
  onClose: () => void
  goal: FinanceGoal
  onSave: (goal: FinanceGoal) => void
}

export default function FinanceGoalModal({ isOpen, onClose, goal, onSave }: FinanceGoalModalProps) {
  const [target, setTarget] = useState('')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [monthly, setMonthly] = useState('')
  const [salary, setSalary] = useState('')

  useEffect(() => {
    if (isOpen) {
      setTarget(String(goal.targetAmount))
      setStartDate(goal.startDate)
      setTargetDate(goal.targetDate)
      setMonthly(String(goal.plannedMonthly))
      setSalary(String(goal.monthlySalary))
    }
  }, [isOpen, goal])

  const targetNum = parseFloat(target.replace(',', '.'))
  const valid = !isNaN(targetNum) && targetNum > 0 && !!startDate && !!targetDate

  const handleSave = () => {
    if (!valid) return
    onSave({
      ...goal,
      targetAmount: targetNum,
      startDate,
      targetDate,
      plannedMonthly: parseFloat(monthly.replace(',', '.')) || 0,
      monthlySalary: parseFloat(salary.replace(',', '.')) || 0,
    })
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Editar meta"
      footer={
        <button
          onClick={handleSave}
          disabled={!valid}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            backgroundColor: valid ? 'var(--primary)' : 'var(--border)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: valid ? 'pointer' : 'not-allowed',
            marginBottom: 4,
          }}
        >
          Guardar
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <Label>Objetivo total (€)</Label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={target}
            onChange={e => setTarget(e.target.value)}
            style={inputStyle}
          />
          <Hint>4 anuidades da Basque × €11.445 = €45.780</Hint>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Início</Label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Prazo</Label>
            <input
              type="date"
              value={targetDate}
              onChange={e => setTargetDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <Label>Poupança mensal planeada (€)</Label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="10"
            value={monthly}
            onChange={e => setMonthly(e.target.value)}
            style={inputStyle}
          />
          <Hint>Nos cruzeiros não há custos de vida — dá para poupar quase tudo.</Hint>
        </div>

        <div>
          <Label>Salário mensal estimado (€)</Label>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="50"
            value={salary}
            onChange={e => setSalary(e.target.value)}
            style={inputStyle}
          />
          <Hint>Usado para calcular que % do salário precisas de poupar. Ajusta ao teu caso.</Hint>
        </div>
      </div>
    </Sheet>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
      {children}
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 6 }}>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface)',
  fontSize: 16,
  color: 'var(--text)',
  outline: 'none',
  fontFamily: 'inherit',
}
