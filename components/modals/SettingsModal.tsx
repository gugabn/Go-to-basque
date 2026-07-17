'use client'

import { useState, useEffect, useRef } from 'react'
import Sheet from '@/components/ui/Sheet'
import { downloadBackup, importBackup } from '@/lib/backup'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [backupMsg, setBackupMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setBackupMsg(null)
    }
  }, [isOpen])

  const handleExport = () => {
    downloadBackup()
    setBackupMsg({ text: 'Backup transferido para o teu dispositivo.', ok: true })
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite reimportar o mesmo ficheiro
    if (!file) return
    const text = await file.text()
    const result = importBackup(text)
    if (result.ok) {
      setBackupMsg({ text: `Backup restaurado (${result.restored} secções). A recarregar…`, ok: true })
      setTimeout(() => window.location.reload(), 1200)
    } else {
      setBackupMsg({ text: result.error ?? 'Não foi possível importar.', ok: false })
    }
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Definições"
      footer={
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 12,
            border: 'none',
            backgroundColor: 'var(--primary)',
            color: '#fff',
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: 4,
          }}
        >
          Fechar
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Cópia de segurança */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            Cópia de segurança
          </div>
          <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10, lineHeight: 1.5 }}>
            Exporta um ficheiro com os teus lançamentos, meta e marcos para o
            guardares ou passares para outro telemóvel. Fica tudo no dispositivo.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button onClick={handleExport} style={backupBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar
            </button>
            <button onClick={() => fileInputRef.current?.click()} style={backupBtnStyle}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Importar
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
          {backupMsg && (
            <div
              style={{
                marginTop: 10,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 12,
                backgroundColor: backupMsg.ok ? 'rgba(122,158,126,0.12)' : 'rgba(232,93,58,0.10)',
                color: backupMsg.ok ? 'var(--sage)' : '#E85D3A',
              }}
            >
              {backupMsg.text}
            </div>
          )}
        </div>

        {/* Sobre */}
        <div
          style={{
            backgroundColor: 'var(--surface2)',
            borderRadius: 12,
            padding: '14px 16px',
            fontSize: 12,
            color: 'var(--muted)',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: 'var(--text)' }}>Rumo à Basque</strong> — controlo de
          poupança para a anuidade da Basque Culinary, com marcos e certificações.
          Todos os dados ficam guardados apenas no teu dispositivo.
        </div>
      </div>
    </Sheet>
  )
}

const backupBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  padding: '12px',
  borderRadius: 10,
  border: '1px solid var(--border)',
  backgroundColor: 'var(--surface2)',
  color: 'var(--text)',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
}
