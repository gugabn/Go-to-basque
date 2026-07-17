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
        bottom: 'calc(24px + env(safe-area-inset-bottom))',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 100,
        backgroundColor: 'var(--text)',
        color: '#fff',
        padding: '12px 20px',
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 500,
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }}
    >
      {message}
    </div>
  )
}
