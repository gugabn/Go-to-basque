'use client'

type Tab = 'resumo' | 'marcos' | 'movimentos'

interface HeaderProps {
  activeTab: Tab
  onAdd: () => void
  onSettings: () => void
}

const SUBTITLES: Record<Tab, string> = {
  resumo: 'Rumo à Basque Culinary',
  marcos: 'Certificações e etapas',
  movimentos: 'Depósitos e levantamentos',
}

const ADD_LABEL: Record<Tab, string> = {
  resumo: 'Novo depósito',
  marcos: 'Novo marco',
  movimentos: 'Novo lançamento',
}

export default function Header({ activeTab, onAdd, onSettings }: HeaderProps) {
  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 30,
        paddingTop: 'env(safe-area-inset-top)',
        background: 'linear-gradient(180deg, rgba(7,8,16,0.85), rgba(7,8,16,0.4))',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 12px' }}>
        {/* Marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 13, flexShrink: 0,
              background: 'var(--accent-grad)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'var(--glow-primary)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0B0B10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z" />
              <line x1="6" y1="17" x2="18" y2="17" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display), sans-serif', fontSize: 18, fontWeight: 700, lineHeight: 1.05, color: 'var(--text)' }}>
              Rumo à Basque
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 2 }}>
              {SUBTITLES[activeTab]}
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={onSettings}
            aria-label="Definições"
            style={{
              width: 42, height: 42, borderRadius: 12,
              border: '1px solid var(--border)', background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--muted)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button
            onClick={onAdd}
            aria-label={ADD_LABEL[activeTab]}
            style={{
              width: 42, height: 42, borderRadius: 12, border: 'none',
              background: 'var(--accent-grad)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0B0B10', boxShadow: 'var(--glow-primary)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  )
}
