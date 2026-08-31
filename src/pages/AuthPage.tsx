import React, { useState } from 'react'
import {
  FolderOpen,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Zap,
  ArrowRight,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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

  const quickUsers = [
    { name: 'Alex Morgan', role: 'Storage Admin', email: 'alex.morgan@workspace.io', pass: 'password123', initials: 'AM' },
    { name: 'Jordan Lee', role: 'Cluster Analyst', email: 'jordan.lee@storage.dev', pass: 'analyst2026', initials: 'JL' }
  ]

  const handleQuickSelect = (u: typeof quickUsers[0]) => {
    setEmail(u.email)
    setPassword(u.pass)
    setError(null)
  }

  const handleInstantDemo = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setLoading(false)
    onAuthenticated?.()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const res = await login(email, password, rememberMe)
        if (!res.success) setError(res.error || 'Incorrect email or password.')
        else onAuthenticated?.()
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Unable to create account.')
        else onAuthenticated?.()
      } else {
        const res = await forgotPassword(email)
        if (!res.success) setError(res.error || 'Request failed.')
        else setSuccessMessage(res.message || 'Check your inbox for password reset instructions.')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-[#f4f1eb] font-sans flex flex-col justify-between overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-200">
      {/* ── 1. Background Video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover scale-105"
        src="/assets/background_video.mp4"
      />

      {/* ── 2. Cinematic Dark Overlay Vignette ── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.78) 75%, #000000 100%),
            linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.85) 100%)
          `
        }}
      />

      {/* ── 3. Top Navigation Header ── */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 sm:px-12 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-[#1a1210] font-black shadow-[0_0_20px_rgba(248,117,103,0.4)]">
            <FolderOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="font-display font-black text-2xl tracking-tighter text-white">
            DEDUPE<span className="text-brand-500">IQ</span>
          </span>
        </div>

        <button
          onClick={handleInstantDemo}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 px-5 py-2 text-xs font-bold text-white transition-all shadow-[0_0_18px_rgba(248,117,103,0.35)] cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Zap size={14} className="fill-white" />
          <span>Instant Demo</span>
        </button>
      </header>

      {/* ── 4. Main Centered Auth Card ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] rounded-3xl border border-white/[0.15] bg-black/75 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.9)] space-y-6">
          {/* Card Title */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold font-display text-white tracking-tight">
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Welcome back. Enter your credentials.'
                : mode === 'signup'
                ? 'Get started with on-device deduplication.'
                : 'Enter your email for password recovery.'}
            </p>
          </div>

          {/* Instant Guest Demo CTA Button */}
          <button
            type="button"
            onClick={handleInstantDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-brand-500 hover:bg-brand-600 py-3 px-4 text-xs font-bold text-white shadow-[0_4px_18px_rgba(248,117,103,0.35)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            <Zap size={14} className="fill-white" />
            <span>One-Click Guest Demo (Preloaded Data)</span>
            <ArrowRight size={14} />
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <span className="relative bg-black/60 px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-400">
              or continue with email
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 rounded-full border border-white/15 bg-white/[0.05] p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={`rounded-full py-1.5 font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
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
                className={`rounded-full py-1.5 font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error / Success Alerts */}
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/20 p-3 text-xs text-rose-200 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 p-3 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-white focus:bg-white/[0.12] transition-colors"
                  required
                />
              </div>
            )}

            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-white focus:bg-white/[0.12] transition-colors"
                required
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/[0.08] pl-4 pr-10 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-white focus:bg-white/[0.12] transition-colors font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="relative">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-white/20 bg-white/[0.08] px-4 py-3 text-xs text-white placeholder-slate-400 outline-none focus:border-white focus:bg-white/[0.12] transition-colors font-mono"
                  required
                />
              </div>
            )}

            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 accent-brand-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setError(null)
                  }}
                  className="hover:underline text-slate-300 hover:text-white"
                >
                  Need help?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white hover:bg-slate-200 py-3 text-xs font-bold text-black transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2 active:scale-[0.99]"
            >
              <span>
                {loading
                  ? 'Please wait...'
                  : mode === 'signin'
                  ? 'Sign In'
                  : mode === 'signup'
                  ? 'Create Account'
                  : 'Send Reset Link'}
              </span>
              {!loading && <ArrowRight size={14} />}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                }}
                className="w-full text-center text-xs text-brand-400 hover:underline pt-1 block"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Quick-Fill Profiles Chips */}
          {mode === 'signin' && (
            <div className="pt-3 border-t border-white/10 space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Quick Test Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickUsers.map(u => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] p-2 text-left hover:border-brand-500/50 hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-brand-500/20 text-brand-300 font-mono font-bold text-[10px]">
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{u.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="text-[10.5px] text-slate-400 leading-relaxed border-t border-white/10 pt-3 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              100% on-device neural processing. Zero cloud latency or telemetry.
            </span>
          </div>
        </div>
      </main>

      {/* ── 5. Footer ── */}
      <footer className="relative z-10 border-t border-white/10 bg-black/60 backdrop-blur-md py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">DedupeIQ</span>
          <span>·</span>
          <span>Intelligent File Deduplication Workstation</span>
        </div>
        <span className="font-mono text-[11px] text-slate-500">FINDATHON 2026</span>
      </footer>
    </div>
  )
}
