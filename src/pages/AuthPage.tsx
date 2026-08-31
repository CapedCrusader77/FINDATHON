import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  CheckCircle2,
  Sparkles,
  Fingerprint,
  HardDrive,
  FolderSync,
  Layers,
  Cpu,
  Radio,
  Wifi,
  BatteryCharging
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Badge, TrafficLights } from '../components/ui'

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

  const quickProfiles = [
    { name: 'Alex Morgan', role: 'Storage Architect (Admin)', email: 'alex.morgan@workspace.io', pass: 'password123', avatar: 'AM', color: 'from-blue-500 to-indigo-600' },
    { name: 'Jordan Lee', role: 'Vision Analyst', email: 'jordan.lee@storage.dev', pass: 'analyst2026', avatar: 'JL', color: 'from-purple-500 to-pink-600' }
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

  const handleInstantGuest = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setLoading(false)
    onAuthenticated?.()
  }

  return (
    <div className="relative min-h-screen w-full bg-[#08090d] text-[#f8fafc] font-sans selection:bg-blue-500/30 selection:text-blue-200 flex flex-col justify-between overflow-x-hidden">
      {/* Fluid Rainbow Mesh Backdrop */}
      <div className="rainbow-mesh-bg">
        <div className="mesh-blob blob-1" />
        <div className="mesh-blob blob-2" />
        <div className="mesh-blob blob-3" />
        <div className="mesh-blob blob-4" />
      </div>

      {/* macOS Top Menu Bar */}
      <header className="relative z-20 flex h-11 items-center justify-between border-b border-white/[0.08] px-5 sm:px-8 bg-white/[0.03] backdrop-blur-2xl text-xs text-slate-300 font-medium">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-white tracking-tight">
            <span className="text-sm"></span>
            <span className="font-display font-bold">DedupeIQ Pro Studio</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="hidden sm:inline text-[11px] text-slate-400">File Intelligence OS 15.4</span>
        </div>

        <div className="flex items-center gap-3.5 text-slate-300 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck size={13} />
            <span className="hidden md:inline">On-Device Neural Engine</span>
          </div>
          <Wifi size={13} className="text-slate-400" />
          <BatteryCharging size={14} className="text-slate-400" />
          <span className="font-mono text-[10px] text-slate-400">100%</span>
        </div>
      </header>

      {/* Main macOS Pro Window / Centerpiece */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-4xl">
          {/* macOS Glass Acrylic Window Frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="rounded-3xl border border-white/[0.14] bg-[#0e121d]/75 backdrop-blur-3xl shadow-window overflow-hidden"
          >
            {/* Window Titlebar */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-white/[0.02] px-5 py-3.5 select-none">
              <TrafficLights />
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                <Sparkles size={13} className="text-blue-400" />
                <span>Workspace Access</span>
              </div>
              <div className="w-12" /> {/* Balancer */}
            </div>

            {/* Window Content Split */}
            <div className="grid lg:grid-cols-[1.1fr_0.9fr] divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
              {/* Left Column: Vision & Feature Architecture */}
              <div className="p-7 sm:p-10 flex flex-col justify-between space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] font-semibold text-blue-300 mb-4">
                    <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    <span>Neural File Organizer</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-display text-white leading-tight">
                    Clean Your Workspace. <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-pink-400 bg-clip-text text-transparent">
                      Keep What Matters.
                    </span>
                  </h1>

                  <p className="mt-3 text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
                    DedupeIQ intelligently scans and identifies duplicate files, camera bursts, and cross-format document revisions with zero cloud uploads.
                  </p>
                </div>

                {/* macOS Pro Feature Cards */}
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-md">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/25">
                      <Cpu size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">SHA-256 Bitwise & Perceptual Hashing</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Detects exact clones and resized photos instantly.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-md">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/25">
                      <Layers size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Cross-Format Document NLP Diffing</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">Compares Word DOCX, PDF drafts, and TXT files.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3.5 backdrop-blur-md">
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                      <HardDrive size={16} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Non-Destructive Safe Quarantine</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">30-day soft staging net with 1-click restore.</p>
                    </div>
                  </div>
                </div>

                {/* Instant Guest Demo Trigger */}
                <div className="pt-2">
                  <Button
                    type="button"
                    variant="glass"
                    size="md"
                    onClick={handleInstantGuest}
                    className="w-full text-xs font-semibold h-10 border-blue-400/30 text-blue-200 hover:text-white"
                  >
                    <Zap size={14} className="text-blue-400" />
                    <span>Quick Guest Demo Access</span>
                    <ArrowRight size={13} />
                  </Button>
                </div>
              </div>

              {/* Right Column: macOS Pro Authentication Form */}
              <div className="p-7 sm:p-9 bg-black/20 flex flex-col justify-center">
                {/* Mode Segmented Controls */}
                <div className="mb-6">
                  {mode !== 'forgot' ? (
                    <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/[0.10] bg-black/40 p-1 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin')
                          setError(null)
                          setSuccessMessage(null)
                        }}
                        className={`rounded-xl py-2 font-semibold transition-all ${
                          mode === 'signin'
                            ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.15]'
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
                        className={`rounded-xl py-2 font-semibold transition-all ${
                          mode === 'signup'
                            ? 'bg-white/[0.12] text-white shadow-sm border border-white/[0.15]'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Create Profile
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-blue-400">Account Help</span>
                        <h2 className="text-sm font-bold text-white mt-0.5">Reset Password</h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signin')
                          setError(null)
                          setSuccessMessage(null)
                        }}
                        className="text-xs text-blue-400 hover:underline font-medium"
                      >
                        ← Back to Sign In
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                {error && (
                  <div className="mb-4 rounded-xl border border-rose-500/35 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
                {successMessage && (
                  <div className="mb-4 rounded-xl border border-emerald-500/35 bg-emerald-500/15 p-3 text-xs text-emerald-200 flex items-center gap-2">
                    <CheckCircle2 size={15} className="shrink-0 text-emerald-400" />
                    <span>{successMessage}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Full Name</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="Alex Morgan"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/[0.08]"
                          required
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address</label>
                    <div className="relative">
                      <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                      <input
                        type="email"
                        placeholder="alex.morgan@workspace.io"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/[0.08]"
                        required
                      />
                    </div>
                  </div>

                  {mode !== 'forgot' && (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-300">Password</label>
                        {mode === 'signin' && (
                          <button
                            type="button"
                            onClick={() => setMode('forgot')}
                            className="text-[11px] text-blue-400 hover:underline"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/[0.08] font-mono"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {mode === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:bg-white/[0.08] font-mono"
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
                          className="h-3.5 w-3.5 rounded border-white/[0.2] bg-black/40 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        />
                        <span>Remember this workstation</span>
                      </label>
                    </div>
                  )}

                  <div className="pt-2">
                    <Button
                      type="submit"
                      size="md"
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs h-10 shadow-glowBlue rounded-xl"
                    >
                      {loading ? (
                        'Authenticating...'
                      ) : mode === 'signin' ? (
                        'Unlock Workspace'
                      ) : mode === 'signup' ? (
                        'Create Studio Account'
                      ) : (
                        'Send Reset Link'
                      )}
                      <ArrowRight size={14} />
                    </Button>
                  </div>
                </form>

                {/* Preset Profiles */}
                {mode === 'signin' && (
                  <div className="mt-5 pt-4 border-t border-white/[0.08] space-y-2">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Quick Profile Autofill:
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {quickProfiles.map(profile => (
                        <button
                          key={profile.email}
                          type="button"
                          onClick={() => handleQuickSelect(profile)}
                          className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2 text-left hover:border-blue-400/40 hover:bg-white/[0.07] transition-all group"
                        >
                          <div className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${profile.color} text-white text-[10px] font-bold shadow-sm`}>
                            {profile.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[11px] font-bold text-white truncate">{profile.name}</p>
                            <p className="text-[9px] text-slate-400 truncate">{profile.role.split(' ')[0]}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* macOS Bottom Status Bar */}
      <footer className="relative z-20 flex h-10 items-center justify-between border-t border-white/[0.08] px-6 sm:px-8 text-[11px] text-slate-400 bg-white/[0.02] backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Local Engine · Zero Telemetry Uploads</span>
        </div>
        <span>macOS Pro Liquid Acrylic Edition</span>
      </footer>
    </div>
  )
}
