import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, Mail, User, ArrowRight, Eye, EyeOff,
  Zap, CheckCircle2, Sparkles, ShieldCheck,
  BatteryCharging, Wifi, HardDrive, Cpu, Layers,
  Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Typewriter, TiltCard, MagneticButton, GlowOrb, ConfettiBurst } from '../components/InteractiveEffects'

/* ─── Soft particle field (pure CSS-driven, no WebGL dep) ─── */
function StarField() {
  const stars = useRef(
    Array.from({ length: 160 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 2.2,
      opacity: 0.12 + Math.random() * 0.55,
      delay: Math.random() * 6,
      duration: 4 + Math.random() * 8
    }))
  ).current

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {stars.map(s => (
        <motion.div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size }}
          animate={{ opacity: [s.opacity * 0.4, s.opacity, s.opacity * 0.4] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ─── Feature Pill Row ─── */
function FeaturePill({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold backdrop-blur-md ${color}`}
    >
      <Icon size={13} />
      {label}
    </motion.div>
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
  const [showConfetti, setShowConfetti] = useState(false)
  const [hoveredProfile, setHoveredProfile] = useState<number | null>(null)

  const quickProfiles = [
    { name: 'Alex Morgan', role: 'Storage Architect', email: 'alex.morgan@workspace.io', pass: 'password123', initials: 'AM', gradient: 'from-blue-500 to-indigo-600', badge: 'Admin' },
    { name: 'Jordan Lee', role: 'Vision Analyst', email: 'jordan.lee@storage.dev', pass: 'analyst2026', initials: 'JL', gradient: 'from-purple-500 to-pink-600', badge: 'Analyst' }
  ]

  const handleQuickSelect = (profile: typeof quickProfiles[0]) => {
    setEmail(profile.email)
    setPassword(profile.pass)
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
        else { setShowConfetti(true); setTimeout(() => onAuthenticated?.(), 700) }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) { setError('Passwords do not match.'); setLoading(false); return }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Registration failed.')
        else { setShowConfetti(true); setTimeout(() => onAuthenticated?.(), 700) }
      } else {
        const res = await forgotPassword(email)
        if (!res.success) setError(res.error || 'Request failed.')
        else setSuccessMessage(res.message || 'Check your inbox.')
      }
    } catch { setError('An unexpected error occurred.') }
    finally { setLoading(false) }
  }

  const handleInstantDemo = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setShowConfetti(true)
    setTimeout(() => { setLoading(false); onAuthenticated?.() }, 700)
  }

  return (
    <div className="relative min-h-screen w-full bg-[#06080f] text-white overflow-hidden flex flex-col">
      {/* Layers: star field + mesh blobs */}
      <StarField />
      <div className="rainbow-mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="mesh-blob blob-4" />
      </div>

      {/* macOS Top Bar */}
      <header className="relative z-20 flex h-11 items-center justify-between border-b border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl px-5 sm:px-10 text-[11px] text-slate-400">
        <div className="flex items-center gap-3 font-bold text-white text-sm tracking-tight">
          <motion.div
            animate={{ rotate: [0, 15, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
            className="text-lg"
          >
            🌀
          </motion.div>
          DedupeIQ <span className="text-[10px] font-normal text-slate-400 ml-1">Pro Studio</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 ping-soft" />
            On-Device Neural Engine
          </span>
          <Wifi size={13} />
          <BatteryCharging size={14} />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Hero Copy & Live Typewriter */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="hidden lg:flex flex-col space-y-7"
          >
            <div className="space-y-4">
              <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-[1.1] font-display">
                Find and delete
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                  <Typewriter words={['duplicates.', 'camera bursts.', 'draft copies.', 'bloat files.']} />
                </span>
              </h1>
              <p className="text-sm text-slate-400 max-w-md leading-relaxed">
                Multi-modal, 100% on-device deduplication. No cloud. No telemetry. Just clean storage.
              </p>
            </div>

            {/* Animated Feature Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { icon: Cpu, label: 'SHA-256 Fast Hashing', color: 'border-blue-500/30 bg-blue-500/10 text-blue-300', delay: 0.1 },
                { icon: Layers, label: 'Perceptual Vision pHash', color: 'border-purple-500/30 bg-purple-500/10 text-purple-300', delay: 0.2 },
                { icon: HardDrive, label: 'Safe 30-day Quarantine', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300', delay: 0.3 },
                { icon: ShieldCheck, label: 'Zero Cloud Uploads', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300', delay: 0.4 },
              ].map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: f.delay, duration: 0.4 }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold backdrop-blur-md ${f.color}`}
                >
                  <f.icon size={13} />
                  {f.label}
                </motion.div>
              ))}
            </div>

            {/* Tilt card preview */}
            <TiltCard className="w-full" intensity={6}>
              <div className="relative rounded-2xl border border-white/[0.10] bg-white/[0.035] backdrop-blur-2xl p-5 overflow-hidden">
                <GlowOrb color="blue" size={120} opacity={0.12} className="-top-6 -right-6" />
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 ping-soft" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Live Workspace</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                    {[
                      { label: 'Clusters', val: '24', col: 'text-blue-400' },
                      { label: 'Reclaimable', val: '3.2 GB', col: 'text-emerald-400' },
                      { label: 'Groups', val: '8', col: 'text-purple-400' }
                    ].map(s => (
                      <div key={s.label} className="rounded-xl border border-white/[0.08] bg-black/30 p-3">
                        <p className="text-[9px] text-slate-400">{s.label}</p>
                        <p className={`mt-1 font-bold text-sm ${s.col}`}>{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>

          {/* Right — Auth Panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="w-full max-w-md mx-auto"
          >
            <div className="relative rounded-3xl border border-white/[0.12] bg-[#0d1120]/80 backdrop-blur-3xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] overflow-hidden">
              {/* Confetti burst on success */}
              <ConfettiBurst active={showConfetti} />

              {/* Ambient glow top */}
              <div className="absolute -top-16 left-1/2 -translate-x-1/2 h-32 w-48 bg-indigo-600/20 blur-3xl pointer-events-none" />

              {/* Window titlebar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full tl-close" />
                  <span className="h-3 w-3 rounded-full tl-minimize" />
                  <span className="h-3 w-3 rounded-full tl-expand" />
                </div>
                <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-400" />
                  Workspace Access
                </span>
                <div className="w-14" />
              </div>

              <div className="p-7 sm:p-9 space-y-6">
                {/* Tab toggle */}
                {mode !== 'forgot' ? (
                  <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.10] bg-black/40 p-1 text-xs">
                    {(['signin', 'signup'] as const).map(m => (
                      <motion.button
                        key={m}
                        type="button"
                        onClick={() => { setMode(m); setError(null); setSuccessMessage(null) }}
                        className={`relative rounded-xl py-2.5 font-bold transition-all ${mode === m ? 'text-white' : 'text-slate-400 hover:text-white'}`}
                        whileTap={{ scale: 0.97 }}
                      >
                        {mode === m && (
                          <motion.div
                            layoutId="tab-indicator"
                            className="absolute inset-0 rounded-xl bg-white/[0.12] border border-white/[0.16]"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative">{m === 'signin' ? 'Sign In' : 'Create Account'}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Recovery</span>
                      <h2 className="text-sm font-bold text-white mt-0.5">Reset Password</h2>
                    </div>
                    <button type="button" onClick={() => { setMode('signin'); setError(null) }} className="text-xs text-blue-400 hover:underline">← Back</button>
                  </div>
                )}

                {/* Notifications */}
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="rounded-xl border border-rose-500/35 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-center gap-2"
                    >
                      <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                      {error}
                    </motion.div>
                  )}
                  {successMessage && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      className="rounded-xl border border-emerald-500/35 bg-emerald-500/15 p-3 text-xs text-emerald-200 flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} className="shrink-0 text-emerald-400" />
                      {successMessage}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Full Name</label>
                        <div className="relative">
                          <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                          <input type="text" placeholder="Alex Morgan" value={name} onChange={e => setName(e.target.value)}
                            className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-3 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/70 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)]"
                            required />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 block">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input type="email" placeholder="alex.morgan@workspace.io" value={email} onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-3 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/70 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)]"
                        required />
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-300">Password</label>
                        {mode === 'signin' && (
                          <button type="button" onClick={() => setMode('forgot')} className="text-[11px] text-blue-400 hover:underline">
                            Forgot?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-10 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/70 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)] font-mono"
                          required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                          className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Confirm Password</label>
                        <div className="relative">
                          <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                          <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                            className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-3 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500/70 focus:bg-white/[0.08] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.18)] font-mono"
                            required />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {mode === 'signin' && (
                    <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                      <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border-white/[0.2] bg-black/40 accent-indigo-500 cursor-pointer" />
                      Remember this workstation
                    </label>
                  )}

                  <MagneticButton
                    type="submit"
                    disabled={loading}
                    className="relative w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-500 text-white font-bold text-xs shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                          Authenticating...
                        </>
                      ) : (
                        <>
                          {mode === 'signin' ? 'Unlock Workspace' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                          <ArrowRight size={15} />
                        </>
                      )}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
                    />
                  </MagneticButton>
                </form>

                {/* Quick Demo Access */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/[0.08]" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#0d1120] px-3 text-[10px] text-slate-500">or quick access</span>
                  </div>
                </div>

                <MagneticButton
                  onClick={handleInstantDemo}
                  disabled={loading}
                  className="w-full h-10 rounded-xl border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.09] text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap size={14} className="text-blue-400" />
                  <span>Instant Guest Demo</span>
                </MagneticButton>

                {/* Profile Quick-Fill Cards */}
                {mode === 'signin' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Preset Profiles:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {quickProfiles.map((profile, i) => (
                        <motion.button
                          key={profile.email}
                          type="button"
                          onClick={() => handleQuickSelect(profile)}
                          onHoverStart={() => setHoveredProfile(i)}
                          onHoverEnd={() => setHoveredProfile(null)}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          className="relative flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-left overflow-hidden group transition-colors hover:border-white/[0.20] hover:bg-white/[0.07]"
                        >
                          <AnimatePresence>
                            {hoveredProfile === i && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-gradient-to-r from-white/[0.03] to-white/[0.06]"
                              />
                            )}
                          </AnimatePresence>
                          <div className={`relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${profile.gradient} text-white text-[11px] font-bold shadow-sm`}>
                            {profile.initials}
                          </div>
                          <div className="relative z-10 min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{profile.name}</p>
                            <p className="text-[9px] text-slate-400 truncate">{profile.badge}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer status bar */}
      <footer className="relative z-20 h-10 flex items-center justify-between border-t border-white/[0.06] bg-white/[0.02] backdrop-blur-xl px-6 text-[10px] text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Local Engine · Zero Telemetry
        </span>
        <span className="hidden sm:inline">macOS Pro Liquid Acrylic Edition</span>
      </footer>
    </div>
  )
}
