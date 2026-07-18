'use client'

import { useState, useEffect } from 'react'
import Sheet from '@/components/ui/Sheet'
import type { Contribution, ContributionType, MoneySource } from '@/lib/types'
import { SOURCES } from '@/lib/types'

interface AddContributionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (contribution: Contribution) => void
}

function newId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AddContributionModal({ isOpen, onClose, onSave }: AddContributionModalProps) {
  const [type, setType] = useState<ContributionType>('deposito')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(todayIso())
  const [note, setNote] = useState('')
  const [source, setSource] = useState<MoneySource>('salario')

  useEffect(() => {
    if (isOpen) {
      setType('deposito')
      setAmount('')
      setDate(todayIso())
      setNote('')
      setSource('salario')
    }
  }, [isOpen])

  const value = parseFloat(amount.replace(',', '.'))
  const valid = !isNaN(value) && value > 0

  const handleSave = () => {
    if (!valid) return
    onSave({
      id: newId(),
      amount: Math.abs(value),
      type,
      date,
      note: note.trim() || undefined,
      source: type === 'deposito' ? source : undefined,
      createdAt: Date.now(),
    })
    onClose()
  }

  const isDeposit = type === 'deposito'

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Novo lançamento"
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
            transition: 'background-color 0.2s',
          }}
        >
          Adicionar
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Tipo: depósito / levantamento */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            padding: 4,
            backgroundColor: 'var(--surface2)',
            borderRadius: 12,
          }}
        >
          {(['deposito', 'levantamento'] as ContributionType[]).map(t => {
            const active = type === t
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  padding: '10px',
                  borderRadius: 9,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  backgroundColor: active ? 'var(--surface)' : 'transparent',
                  color: active
                    ? t === 'deposito' ? 'var(--sage)' : '#E85D3A'
                    : 'var(--muted)',
                  boxShadow: active ? '0 1px 4px var(--shadow)' : 'none',
                  transition: 'all 0.15s',
                }}
              >
                {t === 'deposito' ? 'Depósito' : 'Levantamento'}
              </button>
            )
          })}
        </div>

        {/* Valor */}
        <div>
          <Label>Valor</Label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 18,
                fontWeight: 600,
                color: isDeposit ? 'var(--sage)' : '#E85D3A',
              }}
            >
              {isDeposit ? '+' : '−'}€
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0,00"
              autoFocus
              style={{ ...inputStyle, paddingLeft: 48, fontSize: 18, fontWeight: 600 }}
            />
          </div>
        </div>

        {/* Fonte (só depósitos) */}
        {isDeposit && (
          <div>
            <Label>Fonte</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {SOURCES.map(s => {
                const active = source === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSource(s.id)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '9px 13px', borderRadius: 999, cursor: 'pointer',
                      fontSize: 13, fontWeight: 600,
                      border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
                      background: active ? 'rgba(240,130,74,0.16)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--muted)',
                    }}
                  >
                    <span>{s.emoji}</span>{s.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Data */}
        <div>
          <Label>Data</Label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* Nota */}
        <div>
          <Label>Nota (opcional)</Label>
          <input
            type="text"
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ex: Salário Viking — rotação 1"
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
