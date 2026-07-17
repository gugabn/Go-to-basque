'use client'

import { useState, useEffect } from 'react'
import Sheet from '@/components/ui/Sheet'
import type { Milestone } from '@/lib/types'

interface AddMilestoneModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (milestone: Milestone) => void
  initialData?: Milestone
}

function newId() {
  return 'm-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AddMilestoneModal({ isOpen, onClose, onSave, initialData }: AddMilestoneModalProps) {
  const [title, setTitle] = useState('')
  const [cost, setCost] = useState('')
  const [dueDate, setDueDate] = useState(todayIso())
  const [note, setNote] = useState('')

  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title)
      setCost(String(initialData.cost))
      setDueDate(initialData.dueDate)
      setNote(initialData.note ?? '')
    } else if (isOpen) {
      setTitle('')
      setCost('')
      setDueDate(todayIso())
      setNote('')
    }
  }, [isOpen, initialData])

  const costNum = parseFloat(cost.replace(',', '.'))
  const valid = title.trim().length > 0 && !isNaN(costNum) && costNum >= 0 && !!dueDate

  const handleSave = () => {
    if (!valid) return
    onSave({
      id: initialData?.id ?? newId(),
      title: title.trim(),
      cost: costNum,
      dueDate,
      done: initialData?.done ?? false,
      note: note.trim() || undefined,
      createdAt: initialData?.createdAt ?? Date.now(),
    })
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Editar marco' : 'Novo marco'}
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
          {initialData ? 'Guardar' : 'Adicionar'}
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <Label>Marco</Label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Ex: STCW Basic Safety Training"
            style={inputStyle}
            autoComplete="off"
            autoFocus
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <Label>Custo (€)</Label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="1"
              value={cost}
              onChange={e => setCost(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </div>
          <div>
            <Label>Prazo</Label>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div>
          <Label>Nota (opcional)</Label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ex: Exames em maio e novembro"
            style={inputStyle}
            autoComplete="off"
          />
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
