import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Cpu,
  Layers,
  FileText,
  Image as ImageIcon,
  Check,
  Sliders,
  Terminal,
  KeyRound,
  HardDrive
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Badge } from '../components/ui'

// Interactive Background Canvas: Floating Hash Nodes & Neural File Linkages
function InteractiveNeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const handleResize = () => {
      if (!canvas) return
      width = canvas.width = window.innerWidth
      height = canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    // Node particles
    const nodeCount = Math.min(Math.floor((width * height) / 18000), 55)
    const nodes: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      label: string
      color: string
    }> = []

    const hashLabels = ['sha256', 'pHash', 'dHash', '100%', 'dup', 'master', '0x7F', 'MD5', 'vector', 'louvain', 'diff']
    const colors = ['#6366f1', '#818cf8', '#a855f7', '#10b981', '#06b6d4', '#4f46e5']

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 2 + 1.5,
        label: hashLabels[Math.floor(Math.random() * hashLabels.length)],
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }

    let mouseX = -1000
    let mouseY = -1000

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    window.addEventListener('mousemove', handleMouseMove)

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Connect nodes with proximity lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 130) {
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            const alpha = (1 - dist / 130) * 0.15
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`
            ctx.lineWidth = 0.8
            ctx.stroke()
          }
        }

        // Connect to mouse cursor
        const mdx = nodes[i].x - mouseX
        const mdy = nodes[i].y - mouseY
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy)
        if (mDist < 160) {
          ctx.beginPath()
          ctx.moveTo(nodes[i].x, nodes[i].y)
          ctx.lineTo(mouseX, mouseY)
          const mAlpha = (1 - mDist / 160) * 0.35
          ctx.strokeStyle = `rgba(129, 140, 248, ${mAlpha})`
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Draw and update particle
        const node = nodes[i]
        node.x += node.vx
        node.y += node.vy

        if (node.x < 0 || node.x > width) node.vx *= -1
        if (node.y < 0 || node.y > height) node.vy *= -1

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.shadowColor = node.color
        ctx.shadowBlur = 8
        ctx.fill()
        ctx.shadowBlur = 0

        // Subtle labels on selected nodes
        if (i % 6 === 0) {
          ctx.font = '9px "JetBrains Mono", monospace'
          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)'
          ctx.fillText(node.label, node.x + 6, node.y + 3)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 opacity-60"
    />
  )
}

// Quick interactive comparison mini-widget for interactive demo feel
function InteractiveDedupeDemo() {
  const [slider, setSlider] = useState(88)
  const [activeTab, setActiveTab] = useState<'image' | 'doc'>('image')

  return (
    <div className="rounded-2xl border border-[#222634] bg-[#11141d]/85 p-5 shadow-2xl backdrop-blur-xl transition-all">
      <div className="flex items-center justify-between border-b border-[#1e2230] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="grid h-6 w-6 place-items-center rounded-md bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <Cpu size={13} />
          </div>
          <span className="text-xs font-bold text-white font-mono">Live Multi-Modal Classifier</span>
        </div>
        <div className="flex rounded-md border border-[#222634] bg-[#0c0e14] p-0.5 text-[10px]">
          <button
            onClick={() => setActiveTab('image')}
            className={`rounded px-2 py-0.5 font-semibold transition-colors ${
              activeTab === 'image' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Photos
          </button>
          <button
            onClick={() => setActiveTab('doc')}
            className={`rounded px-2 py-0.5 font-semibold transition-colors ${
              activeTab === 'doc' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Documents
          </button>
        </div>
      </div>

      {/* Interactive Item Pair */}
      <div className="space-y-2">
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-2.5 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-emerald-500 text-slate-950 font-bold text-[9px]">
              ★
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-white truncate text-[11px]">
                {activeTab === 'image' ? 'IMG_2025_Master_RAW.dng' : 'Q4_Financial_Report_Final.pdf'}
              </p>
              <p className="text-[10px] text-emerald-300 font-mono">
                {activeTab === 'image' ? '34.2 MB · 6000x4000 · 100% Quality' : '2.4 MB · 18 pages · Clean Text'}
              </p>
            </div>
          </div>
          <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/40 shrink-0">
            MASTER
          </span>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-[#222634] bg-[#0c0e14] p-2.5 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0 ml-1.5" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-300 truncate text-[11px]">
                {activeTab === 'image' ? 'IMG_2025_Resized_Copy.jpg' : 'Q4_Financial_Report_Draft.docx'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                {activeTab === 'image' ? '4.1 MB · 1920x1080 · 72 DPI' : '1.8 MB · 16 pages · 94% N-gram'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-brand-400 shrink-0">
            {slider}% Match
          </span>
        </div>
      </div>

      {/* Interactive Similarity Bar */}
      <div className="mt-4 pt-3 border-t border-[#1e2230] space-y-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Sliders size={12} className="text-brand-400" />
            <span>Sensitivity Simulation:</span>
          </span>
          <span className="font-mono font-bold text-brand-400">≥ {slider}%</span>
        </div>
        <input
          type="range"
          min="70"
          max="99"
          value={slider}
          onChange={e => setSlider(Number(e.target.value))}
          className="w-full h-1.5 bg-[#1e2230] rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
      </div>
    </div>
  )
}

export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const quickDemoAccounts = [
    { label: '⚡ Admin Demo', email: 'alex.morgan@workspace.io', pass: 'password123', role: 'Full Admin' },
    { label: '👤 Analyst Demo', email: 'jordan.lee@storage.dev', pass: 'analyst2026', role: 'Analyst' }
  ]

  const handleQuickFill = (acc: typeof quickDemoAccounts[0]) => {
    setEmail(acc.email)
    setPassword(acc.pass)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const res = await login(email, password, rememberMe)
        if (!res.success) setError(res.error || 'Authentication failed.')
        else onAuthenticated?.()
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Registration failed.')
        else onAuthenticated?.()
      } else {
        const res = await forgotPassword(email)
        if (!res.success) setError(res.error || 'Password reset request failed.')
        else setSuccessMessage(res.message || 'Check your inbox for reset instructions.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInstantLaunch = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setLoading(false)
    onAuthenticated?.()
  }

  return (
    <div className="relative min-h-screen bg-[#0c0e14] text-slate-100 flex flex-col justify-between selection:bg-brand-500/30 selection:text-brand-200 overflow-hidden">
      {/* Interactive Background Particle Mesh */}
      <InteractiveNeuralBackground />

      {/* Subtle Glow Spheres */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-600/10 blur-[130px]" />
      <div className="pointer-events-none absolute -right-40 -bottom-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px]" />

      {/* Top Bar */}
      <header className="relative z-10 flex h-16 items-center justify-between px-6 sm:px-12 border-b border-[#1e2230]/80 bg-[#0c0e14]/70 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white shadow-glow">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              Dedupe<span className="text-brand-400">IQ</span>
            </span>
            <span className="ml-2 text-[9px] uppercase font-mono tracking-widest text-slate-500">
              Desktop Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 rounded-md">
            <ShieldCheck size={13} />
            <span>100% Local-First Engine</span>
          </div>

          <button
            onClick={handleInstantLaunch}
            className="flex items-center gap-1.5 text-xs font-semibold text-brand-300 hover:text-white bg-[#1c2130] hover:bg-brand-600 border border-brand-500/30 px-3 py-1.5 rounded-lg transition-all shadow-sm"
          >
            <Zap size={13} className="text-brand-400" />
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          {/* Left Column: Interactive Value Proposition & Mini Playground */}
          <div className="hidden lg:flex flex-col space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-300 mb-3">
                <span className="h-2 w-2 rounded-full bg-brand-400 animate-ping" />
                <span>Multi-Modal Deduplication AI</span>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white font-display leading-tight">
                Organize Your Files With Precision & Clarity.
              </h1>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-md">
                Automatically detect identical byte copies, resized camera photos, and cross-format document revisions without moving a single file outside your device.
              </p>
            </div>

            {/* Interactive Live Demo Card */}
            <InteractiveDedupeDemo />

            {/* 3 Core Pillars */}
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-xl border border-[#1e2230] bg-[#11141d]/70 p-3 text-xs">
                <p className="font-bold text-white text-[11px]">Cryptographic Pass</p>
                <p className="text-[10px] text-slate-500 mt-0.5">SHA-256 instant bit matches</p>
              </div>
              <div className="rounded-xl border border-[#1e2230] bg-[#11141d]/70 p-3 text-xs">
                <p className="font-bold text-brand-300 text-[11px]">Perceptual Vision</p>
                <p className="text-[10px] text-slate-500 mt-0.5">pHash & dHash visual similarity</p>
              </div>
              <div className="rounded-xl border border-[#1e2230] bg-[#11141d]/70 p-3 text-xs">
                <p className="font-bold text-emerald-400 text-[11px]">Safe Quarantine</p>
                <p className="text-[10px] text-slate-500 mt-0.5">30-day instant restore net</p>
              </div>
            </div>
          </div>

          {/* Right Column: Clean & Interactive Login Card */}
          <div className="w-full max-w-md mx-auto">
            <Card className="p-6 sm:p-8 bg-[#11141d]/90 border-[#222634] shadow-2xl backdrop-blur-2xl">
              {/* Tab Selector */}
              <div className="mb-6">
                {mode !== 'forgot' ? (
                  <div className="grid grid-cols-2 gap-1 rounded-lg border border-[#222634] bg-[#0c0e14] p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className={`relative rounded-md py-2 font-semibold transition-all ${
                        mode === 'signin'
                          ? 'bg-[#1b1f2b] text-white shadow-sm border border-[#2d3448]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signup')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className={`relative rounded-md py-2 font-semibold transition-all ${
                        mode === 'signup'
                          ? 'bg-[#1b1f2b] text-white shadow-sm border border-[#2d3448]'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-400">Account Recovery</span>
                      <h2 className="text-base font-bold text-white mt-0.5">Reset Password</h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin')
                        setError(null)
                        setSuccessMessage(null)
                      }}
                      className="text-xs text-brand-400 hover:underline font-medium"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Error & Success Messages */}
              {error && (
                <div className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-300 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 size={14} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Alex Morgan"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-lg border border-[#272d3f] bg-[#0c0e14] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      placeholder="alex.morgan@workspace.io"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-[#272d3f] bg-[#0c0e14] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
                      required
                    />
                  </div>
                </div>

                {mode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300">Password</label>
                      {mode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setMode('forgot')}
                          className="text-[10px] text-brand-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full rounded-lg border border-[#272d3f] bg-[#0c0e14] pl-9 pr-10 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 font-mono"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-white"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300">Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full rounded-lg border border-[#272d3f] bg-[#0c0e14] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                {mode === 'signin' && (
                  <div className="flex items-center justify-between pt-0.5">
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={e => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-[#272d3f] bg-[#0c0e14] text-brand-600 focus:ring-brand-500 cursor-pointer"
                      />
                      <span className="text-[11px]">Remember workstation session</span>
                    </label>
                  </div>
                )}

                <div className="pt-2 space-y-2">
                  <Button
                    type="submit"
                    size="md"
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs h-9.5 shadow-sm"
                  >
                    {loading ? (
                      'Authenticating...'
                    ) : mode === 'signin' ? (
                      'Sign In to Workspace'
                    ) : mode === 'signup' ? (
                      'Create Local Account'
                    ) : (
                      'Send Reset Instructions'
                    )}
                    <ArrowRight size={13} />
                  </Button>
                </div>
              </form>

              {/* Quick Fill Demo Credentials Chips */}
              {mode === 'signin' && (
                <div className="mt-5 pt-4 border-t border-[#1e2230] space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>⚡ Quick Preset Credentials:</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {quickDemoAccounts.map(acc => (
                      <button
                        key={acc.label}
                        type="button"
                        onClick={() => handleQuickFill(acc)}
                        className="flex items-center justify-between rounded-lg border border-[#272d3f] bg-[#0c0e14] px-2.5 py-1.5 text-left hover:border-brand-500/50 hover:bg-[#161922] transition-colors group"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white truncate">{acc.label}</p>
                          <p className="text-[9px] text-slate-500 font-mono truncate">{acc.email.split('@')[0]}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 group-hover:text-brand-400 font-mono">fill</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex h-12 items-center justify-between border-t border-[#1e2230]/80 bg-[#0c0e14]/70 px-6 sm:px-12 text-[10px] text-slate-500 font-mono backdrop-blur-md">
        <span>DedupeIQ Multi-Modal Storage Organizer v1.0</span>
        <span className="hidden sm:inline">SHA-256 · Perceptual Hashes · Louvain Community Clustering</span>
      </footer>
    </div>
  )
}
