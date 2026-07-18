// Confetti leve em canvas, sem dependências. Respeita prefers-reduced-motion.

interface Particle {
  x: number; y: number
  vx: number; vy: number
  size: number
  rot: number; vrot: number
  color: string
  life: number
}

const COLORS = ['#F0824A', '#F5B44C', '#3FD9A2', '#FFDDAE', '#FFFFFF']

/**
 * Dispara uma rajada de confetti.
 * @param intensity número de partículas (default 90)
 */
export function celebrate(intensity = 90): void {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const dpr = Math.min(2, window.devicePixelRatio || 1)
  const W = window.innerWidth
  const H = window.innerHeight

  const canvas = document.createElement('canvas')
  canvas.width = W * dpr
  canvas.height = H * dpr
  Object.assign(canvas.style, {
    position: 'fixed', inset: '0', width: '100%', height: '100%',
    pointerEvents: 'none', zIndex: '9999',
  } as CSSStyleDeclaration)
  document.body.appendChild(canvas)

  const ctx = canvas.getContext('2d')
  if (!ctx) { canvas.remove(); return }
  ctx.scale(dpr, dpr)

  // Duas fontes: cantos superiores, a disparar para dentro/cima.
  const particles: Particle[] = []
  const sources = [
    { x: W * 0.18, y: H * 0.14, dir: 1 },
    { x: W * 0.82, y: H * 0.14, dir: -1 },
  ]
  for (const s of sources) {
    for (let i = 0; i < intensity / 2; i++) {
      const angle = (-Math.PI / 2) + s.dir * (Math.random() * 0.9 - 0.1)
      const speed = 6 + Math.random() * 9
      particles.push({
        x: s.x, y: s.y,
        vx: Math.cos(angle) * speed + s.dir * 2,
        vy: Math.sin(angle) * speed - 2,
        size: 5 + Math.random() * 6,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.4,
        color: COLORS[(Math.random() * COLORS.length) | 0],
        life: 1,
      })
    }
  }

  const gravity = 0.28
  const drag = 0.992
  const start = performance.now()
  const DURATION = 2600

  function frame(now: number) {
    const elapsed = now - start
    ctx!.clearRect(0, 0, W, H)
    let alive = false

    for (const p of particles) {
      p.vx *= drag
      p.vy = p.vy * drag + gravity
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vrot
      if (elapsed > DURATION * 0.55) p.life -= 0.018
      if (p.life <= 0 || p.y > H + 40) continue
      alive = true

      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate(p.rot)
      ctx!.globalAlpha = Math.max(0, p.life)
      ctx!.fillStyle = p.color
      ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx!.restore()
    }

    if (alive && elapsed < DURATION + 400) {
      requestAnimationFrame(frame)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(frame)
}
