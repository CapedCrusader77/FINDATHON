import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'

/* ─── Animated Counter Hook ─── */
export function useAnimatedCounter(target: number, duration = 1200) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start: number | null = null
    const from = 0
    const step = (ts: number) => {
      if (!start) start = ts
      const progress = Math.min((ts - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.floor(from + (target - from) * eased))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [target, duration])
  return display
}

/* ─── Magnetic Hover Button ─── */
export function MagneticButton({
  children,
  className = '',
  onClick,
  disabled,
  type = 'button'
}: {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  const ref = useRef<HTMLButtonElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 380, damping: 26 })
  const springY = useSpring(y, { stiffness: 380, damping: 26 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current || disabled) return
    const rect = ref.current.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    x.set((e.clientX - cx) * 0.28)
    y.set((e.clientY - cy) * 0.28)
  }

  const handleMouseLeave = () => { x.set(0); y.set(0) }

  return (
    <motion.button
      ref={ref}
      type={type}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: disabled ? 1 : 0.96 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </motion.button>
  )
}

/* ─── Tilt Card ─── */
export function TiltCard({
  children,
  className = '',
  intensity = 8
}: {
  children: React.ReactNode
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springX = useSpring(rotateX, { stiffness: 280, damping: 22 })
  const springY = useSpring(rotateY, { stiffness: 280, damping: 22 })

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    rotateX.set((0.5 - py) * intensity)
    rotateY.set((px - 0.5) * intensity)
  }

  const handleMouseLeave = () => { rotateX.set(0); rotateY.set(0) }

  return (
    <motion.div
      ref={ref}
      style={{ rotateX: springX, rotateY: springY, transformStyle: 'preserve-3d', transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/* ─── Glowing Orb ─── */
export function GlowOrb({
  color = 'blue',
  size = 180,
  opacity = 0.18,
  className = ''
}: {
  color?: 'blue' | 'purple' | 'emerald' | 'rose' | 'amber'
  size?: number
  opacity?: number
  className?: string
}) {
  const colors = {
    blue:    'radial-gradient(circle, rgba(59,130,246,1) 0%, rgba(99,102,241,0.5) 50%, transparent 100%)',
    purple:  'radial-gradient(circle, rgba(168,85,247,1) 0%, rgba(217,70,239,0.5) 50%, transparent 100%)',
    emerald: 'radial-gradient(circle, rgba(16,185,129,1) 0%, rgba(5,150,105,0.5) 50%, transparent 100%)',
    rose:    'radial-gradient(circle, rgba(244,63,94,1) 0%, rgba(236,72,153,0.5) 50%, transparent 100%)',
    amber:   'radial-gradient(circle, rgba(245,158,11,1) 0%, rgba(249,115,22,0.5) 50%, transparent 100%)'
  }
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-[55px] ${className}`}
      style={{ width: size, height: size, background: colors[color], opacity }}
    />
  )
}

/* ─── Particle Burst on Click ─── */
export function ParticleBurst({ trigger, color = '#3b82f6' }: { trigger: boolean, color?: string }) {
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; angle: number }[]>([])

  useEffect(() => {
    if (!trigger) return
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: Date.now() + i,
      x: 0, y: 0,
      angle: (i / 12) * 360
    }))
    setParticles(newParticles)
    const t = setTimeout(() => setParticles([]), 700)
    return () => clearTimeout(t)
  }, [trigger])

  return (
    <AnimatePresence>
      {particles.map(p => (
        <motion.div
          key={p.id}
          initial={{ scale: 0, opacity: 1, x: 0, y: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [1, 0.8, 0],
            x: Math.cos((p.angle * Math.PI) / 180) * 40,
            y: Math.sin((p.angle * Math.PI) / 180) * 40
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full"
          style={{ background: color, top: '50%', left: '50%', translateX: '-50%', translateY: '-50%' }}
        />
      ))}
    </AnimatePresence>
  )
}

/* ─── Typewriter ─── */
export function Typewriter({
  words,
  className = ''
}: {
  words: string[]
  className?: string
}) {
  const [wordIdx, setWordIdx] = useState(0)
  const [charIdx, setCharIdx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && charIdx < current.length) {
      timeout = setTimeout(() => setCharIdx(c => c + 1), 75)
    } else if (!deleting && charIdx === current.length) {
      timeout = setTimeout(() => setDeleting(true), 1800)
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => setCharIdx(c => c - 1), 40)
    } else if (deleting && charIdx === 0) {
      setDeleting(false)
      setWordIdx(i => (i + 1) % words.length)
    }

    return () => clearTimeout(timeout)
  }, [charIdx, deleting, wordIdx, words])

  return (
    <span className={className}>
      {words[wordIdx].slice(0, charIdx)}
      <span className="inline-block w-0.5 h-[1em] bg-current align-middle ml-0.5 animate-pulse" />
    </span>
  )
}

/* ─── Shimmer Skeleton ─── */
export function SkeletonLine({ width = 'w-full', height = 'h-4', className = '' }: { width?: string, height?: string, className?: string }) {
  return <div className={`${width} ${height} rounded-lg skeleton ${className}`} />
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 space-y-3 ${className}`}>
      <SkeletonLine width="w-1/3" height="h-3" />
      <SkeletonLine width="w-full" height="h-8" />
      <SkeletonLine width="w-2/3" height="h-3" />
    </div>
  )
}

/* ─── Confetti Burst ─── */
export function ConfettiBurst({ active }: { active: boolean }) {
  const colors = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#f43f5e', '#06b6d4']
  const [pieces, setPieces] = useState<{ id: number; color: string; x: number; rotation: number; size: number }[]>([])

  useEffect(() => {
    if (!active) return
    const newPieces = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      color: colors[i % colors.length],
      x: (Math.random() - 0.5) * 220,
      rotation: Math.random() * 360,
      size: 4 + Math.random() * 6
    }))
    setPieces(newPieces)
    const t = setTimeout(() => setPieces([]), 1200)
    return () => clearTimeout(t)
  }, [active])

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-inherit">
      <AnimatePresence>
        {pieces.map(p => (
          <motion.div
            key={p.id}
            initial={{ opacity: 1, y: 0, x: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, y: -100 + Math.random() * -80, x: p.x, rotate: p.rotation, scale: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 + Math.random() * 0.4, ease: 'easeOut' }}
            className="absolute"
            style={{
              bottom: '40%',
              left: '50%',
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
