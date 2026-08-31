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
    { name: 'Alex Morgan', role: 'Admin', email: 'alex.morgan@workspace.io', pass: 'password123', initials: 'AM' },
    { name: 'Jordan Lee', role: 'Analyst', email: 'jordan.lee@storage.dev', pass: 'analyst2026', initials: 'JL' }
  ]

  const handleQuickSelect = (userItem: typeof quickUsers[0]) => {
    setEmail(userItem.email)
    setPassword(userItem.pass)
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
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-black text-[#f4f1eb] font-sans flex flex-col justify-between overflow-x-hidden selection:bg-brand-500/30 selection:text-brand-200">
      {/* ── 1. Full-Bleed Cinematic Background Image ── */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-105 transform transition-transform duration-1000"
        style={{
          backgroundImage: `url('/assets/cinematic_bg.jpg')`
        }}
      />

      {/* ── 2. Multi-Layered Netflix-Style Dark Vignette ── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.85) 75%, #000000 100%),
            linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.85) 100%)
          `
        }}
      />

      {/* ── 3. Top Navigation Header ── */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 sm:px-14">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-white font-black shadow-[0_0_20px_rgba(248,117,103,0.4)]">
            <FolderOpen size={20} strokeWidth={2.5} />
          </div>
          <span className="font-display font-black text-2xl tracking-tighter text-white">
            DEDUPE<span className="text-brand-500">IQ</span>
          </span>
        </div>

        <button
          onClick={handleInstantDemo}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-xs font-bold text-white transition-all shadow-[0_0_18px_rgba(248,117,103,0.35)] cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Zap size={14} className="fill-white" />
          <span>Instant Demo</span>
        </button>
      </header>

      {/* ── 4. Main Centered Netflix-Style Auth Card ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[450px] rounded-2xl border border-white/[0.12] bg-black/80 backdrop-blur-2xl p-8 sm:p-12 shadow-[0_25px_70px_rgba(0,0,0,0.9)] space-y-6">
          {/* Card Title */}
          <div>
            <h1 className="text-3xl font-bold font-display text-white tracking-tight">
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {mode === 'signin'
                ? 'Enter your credentials to access your local workspace.'
                : mode === 'signup'
                ? 'Register an isolated workspace instance.'
                : 'Enter your email to receive recovery instructions.'}
            </p>
          </div>

          {/* Error / Success Alerts */}
          {error && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-[#161616]/90 px-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:border-white focus:bg-[#1f1f1f] transition-all"
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
                className="w-full rounded-lg border border-white/20 bg-[#161616]/90 px-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:border-white focus:bg-[#1f1f1f] transition-all"
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
                  className="w-full rounded-lg border border-white/20 bg-[#161616]/90 pl-4 pr-11 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:border-white focus:bg-[#1f1f1f] transition-all font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-4 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
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
                  className="w-full rounded-lg border border-white/20 bg-[#161616]/90 px-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none focus:border-white focus:bg-[#1f1f1f] transition-all font-mono"
                  required
                />
              </div>
            )}

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 py-3.5 text-sm font-bold text-white transition-all shadow-[0_4px_18px_rgba(248,117,103,0.3)] cursor-pointer disabled:opacity-50 active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
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
              {!loading && <ArrowRight size={16} />}
            </button>

            {/* Remember Me & Help Links */}
            {mode === 'signin' && (
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-[#161616] accent-brand-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot')
                    setError(null)
                  }}
                  className="hover:underline hover:text-white transition-colors"
                >
                  Need help?
                </button>
              </div>
            )}
          </form>

          {/* Quick Profile Chips */}
          {mode === 'signin' && (
            <div className="pt-4 border-t border-white/10 space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick-Fill Test Profiles
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickUsers.map(u => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2 text-left hover:border-brand-500/50 hover:bg-white/[0.08] transition-all cursor-pointer"
                  >
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-brand-500/20 text-brand-300 font-mono font-bold text-[10px]">
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{u.name}</p>
                      <p className="text-[9px] text-slate-400 truncate">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Mode Switch Footnote */}
          <div className="text-xs text-slate-400 pt-2">
            {mode === 'signin' ? (
              <p>
                New to DedupeIQ?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="font-bold text-white hover:underline ml-1"
                >
                  Sign up now.
                </button>
              </p>
            ) : (
              <p>
                Already have a workspace?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className="font-bold text-white hover:underline ml-1"
                >
                  Sign in.
                </button>
              </p>
            )}
          </div>

          {/* Privacy Footnote */}
          <div className="text-[10.5px] text-slate-500 leading-relaxed border-t border-white/10 pt-3 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              This page uses 100% on-device neural processing to protect your local files. No cloud uploads.
            </span>
          </div>
        </div>
      </main>

      {/* ── 5. Netflix-Style Minimal Footer ── */}
      <footer className="relative z-10 border-t border-white/10 bg-black/80 backdrop-blur-md py-6 px-6 sm:px-14 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <span>DedupeIQ Engine</span>
            <span>100% Local Sandbox</span>
            <span>Privacy Guarantee</span>
            <span>FINDATHON 2026</span>
          </div>
          <span className="font-mono text-[11px] text-slate-600">v1.2 On-Device</span>
        </div>
      </footer>
    </div>
  )
}
