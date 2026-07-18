'use client'

type Tab = 'resumo' | 'analise' | 'marcos' | 'movimentos'

interface BottomNavProps {
  activeTab: Tab
  onChange: (tab: Tab) => void
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'resumo', label: 'Resumo',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 3a9 9 0 0 1 9 9" strokeWidth="2.6" />
      </svg>
    ),
  },
  {
    id: 'analise', label: 'Análise',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 14l4-4 3 3 5-6" strokeWidth="2.4" />
      </svg>
    ),
  },
  {
    id: 'marcos', label: 'Marcos',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 11l3 3L22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    id: 'movimentos', label: 'Movimentos',
    icon: (
      <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 11 21 7 17 3" />
        <line x1="21" y1="7" x2="7" y2="7" />
        <polyline points="7 21 3 17 7 13" />
        <line x1="3" y1="17" x2="17" y2="17" />
      </svg>
    ),
  },
]

export default function BottomNav({ activeTab, onChange }: BottomNavProps) {
  return (
    <nav
      style={{
        position: 'fixed',
        left: '50%', transform: 'translateX(-50%)',
        bottom: 'calc(14px + env(safe-area-inset-bottom))',
        zIndex: 40,
        width: 'min(calc(100% - 32px), 398px)',
        display: 'flex',
        padding: 6, gap: 4,
        borderRadius: 20,
        background: 'linear-gradient(180deg, rgba(24,27,38,0.85), rgba(14,16,24,0.9))',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(22px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(22px) saturate(1.4)',
        boxShadow: '0 16px 44px rgba(0,0,0,0.55)',
      }}
    >
      {TABS.map(tab => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            aria-label={tab.label}
            aria-current={active ? 'page' : undefined}
            style={{
              flex: 1,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '9px 0',
              borderRadius: 15, border: 'none', cursor: 'pointer',
              background: active ? 'rgba(240,130,74,0.16)' : 'transparent',
              color: active ? 'var(--primary)' : 'var(--muted)',
              boxShadow: active ? 'inset 0 0 0 1px rgba(240,130,74,0.35)' : 'none',
              transition: 'color 0.2s, background 0.2s',
            }}
          >
            <span style={{ filter: active ? 'drop-shadow(0 0 6px rgba(240,130,74,0.7))' : 'none', display: 'flex' }}>
              {tab.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, lineHeight: 1, letterSpacing: '0.01em' }}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
