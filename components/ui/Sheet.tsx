'use client'

import { useEffect, useRef } from 'react'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export default function Sheet({ isOpen, onClose, title, children, footer }: SheetProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      className="animate-fadeIn"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(44, 44, 44, 0.55)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        className="animate-slideUp"
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: 'var(--surface)',
          borderRadius: '20px 20px 0 0',
          maxHeight: '92dvh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: 'var(--border)',
            }}
          />
        </div>

        {/* Header */}
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px 12px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 20,
                color: 'var(--text)',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Fechar"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 8,
                borderRadius: 8,
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 20px',
            WebkitOverflowScrolling: 'touch',
          }}
          className="scrollbar-hide"
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '12px 20px 0',
              borderTop: '1px solid var(--border)',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
