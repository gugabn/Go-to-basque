'use client'

interface RingProps {
  progress: number      // 0..1
  size?: number
  stroke?: number
  centerTop?: string    // texto grande ao centro (ex.: "6%")
  centerLabel?: string  // texto pequeno por baixo (ex.: "da meta")
}

export default function Ring({
  progress,
  size = 168,
  stroke = 14,
  centerTop,
  centerLabel,
}: RingProps) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, Math.max(0, progress)))

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0824A" />
            <stop offset="100%" stopColor="#F5B44C" />
          </linearGradient>
        </defs>
        {/* trilho */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke}
        />
        {/* progresso com brilho */}
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke="url(#ringGrad)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 1s cubic-bezier(0.32,0.72,0,1)',
            filter: 'drop-shadow(0 0 10px rgba(240,130,74,0.65))',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        {centerTop && (
          <span
            className="grad-text tnum"
            style={{
              fontFamily: 'var(--font-display), sans-serif',
              fontSize: size * 0.24, fontWeight: 800, lineHeight: 1,
            }}
          >
            {centerTop}
          </span>
        )}
        {centerLabel && (
          <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, letterSpacing: '0.02em' }}>
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  )
}
