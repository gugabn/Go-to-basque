'use client'

interface ToastProps {
  message: string
  visible: boolean
}

export default function Toast({ message, visible }: ToastProps) {
  if (!visible || !message) return null

  return (
    <div
      className="animate-toastIn"
      style={{
        position: 'fixed',
        bottom: 'calc(104px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'linear-gradient(180deg, rgba(30,34,46,0.96), rgba(18,21,31,0.96))',
        border: '1px solid var(--border-strong)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        color: 'var(--text)',
        padding: '12px 20px',
        borderRadius: 999,
        fontSize: 14,
        fontWeight: 600,
        whiteSpace: 'nowrap',
        boxShadow: '0 12px 34px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  )
}
