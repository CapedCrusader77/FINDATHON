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
    <div className="relative min-h-screen w-full bg-[#030407] text-[#f4f1eb] font-sans flex flex-col justify-between selection:bg-[#2B66D3]/30 selection:text-[#8BB3E8] overflow-x-hidden">
      {/* ── Background Level2 Ambient Glows ── */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        {/* Top radial blue glow */}
        <div
          className="absolute -top-48 left-1/2 -translate-x-1/2 h-[550px] w-[900px] rounded-full opacity-35 blur-[130px]"
          style={{
            background: 'radial-gradient(circle, #2B66D3 0%, #4B7CE5 40%, transparent 80%)'
          }}
        />
        {/* Bottom subtle ambient */}
        <div
          className="absolute -bottom-48 right-10 h-[400px] w-[600px] rounded-full opacity-15 blur-[120px]"
          style={{
            background: 'radial-gradient(circle, #8BB3E8 0%, #2B66D3 50%, transparent 80%)'
          }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* ── Header Bar ── */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 sm:px-12 max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-[#4B7CE5] via-[#2B66D3] to-[#1E4EB0] text-white font-black shadow-[0_0_20px_rgba(43,102,211,0.45)]">
            <FolderOpen size={18} strokeWidth={2.5} />
          </div>
          <span className="font-display font-black text-xl tracking-tight text-white">
            Dedupe<span className="text-[#8BB3E8]">IQ</span>
          </span>
        </div>

        <button
          onClick={handleInstantDemo}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#4B7CE5] via-[#2B66D3] to-[#8BB3E8] hover:from-[#3754E4] hover:via-[#2B66D3] hover:to-[#4B7CE5] px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(43,102,211,0.4)] transition-all cursor-pointer disabled:opacity-50 active:scale-95"
        >
          <Zap size={13} className="fill-white" />
          <span>Instant Demo</span>
        </button>
      </header>

      {/* ── Centered Card ── */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-[440px] rounded-3xl border border-white/[0.10] bg-[#0b0d13]/85 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_25px_80px_rgba(0,0,0,0.8)] space-y-6">
          {/* Headline */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
              {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === 'signin'
                ? 'Welcome back. Enter your workspace credentials.'
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
            className="w-full flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#4B7CE5] via-[#2B66D3] to-[#8BB3E8] hover:from-[#3754E4] hover:via-[#2B66D3] hover:to-[#4B7CE5] py-3 px-4 text-xs font-bold text-white shadow-[0_0_22px_rgba(43,102,211,0.35)] transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
          >
            <Zap size={14} className="fill-white" />
            <span>One-Click Guest Demo (Preloaded Data)</span>
            <ArrowRight size={14} />
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative bg-[#0b0d13] px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              or continue with email
            </span>
          </div>

          {/* Mode Switcher Tabs */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-[#12151e] p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={`rounded-full py-1.5 font-bold transition-all ${
                  mode === 'signin'
                    ? 'bg-white text-[#030407] shadow-sm'
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
                className={`rounded-full py-1.5 font-bold transition-all ${
                  mode === 'signup'
                    ? 'bg-white text-[#030407] shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error / Success Alerts */}
          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-3 text-xs text-rose-200 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/15 p-3 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151e] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#4B7CE5] focus:bg-[#161a25] transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="alex.morgan@workspace.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#12151e] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#4B7CE5] focus:bg-[#161a25] transition-colors"
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
                      onClick={() => {
                        setMode('forgot')
                        setError(null)
                      }}
                      className="text-[10.5px] text-[#8BB3E8] hover:underline"
                    >
                      Forgot?
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
                    className="w-full rounded-xl border border-white/10 bg-[#12151e] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#4B7CE5] focus:bg-[#161a25] transition-colors font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#12151e] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#4B7CE5] focus:bg-[#161a25] transition-colors font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none pt-0.5">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-white/20 bg-[#12151e] accent-[#2B66D3] cursor-pointer"
                />
                <span>Remember this workspace</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-white hover:bg-slate-200 py-3 text-xs font-bold text-[#030407] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2"
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
                className="w-full text-center text-xs text-[#8BB3E8] hover:underline pt-1 block"
              >
                ← Back to Sign In
              </button>
            )}
          </form>

          {/* Quick-Fill Profiles Chips */}
          {mode === 'signin' && (
            <div className="pt-3 border-t border-white/[0.08] space-y-2">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center">
                Quick Test Credentials
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickUsers.map(u => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#12151e] p-2 text-left hover:border-[#4B7CE5]/50 hover:bg-[#181c28] transition-all cursor-pointer"
                  >
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[#2B66D3]/20 text-[#8BB3E8] font-mono font-bold text-[10px]">
                      {u.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{u.name}</p>
                      <p className="text-[9px] text-slate-500 truncate">{u.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Privacy Footnote */}
          <div className="text-[10.5px] text-slate-500 leading-relaxed border-t border-white/[0.08] pt-3 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              100% on-device neural processing. Zero cloud latency or telemetry.
            </span>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#030407]/80 py-5 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">DedupeIQ</span>
          <span>·</span>
          <span>Intelligent File Deduplication Workstation</span>
        </div>
        <span className="font-mono text-[11px] text-slate-600">FINDATHON 2026</span>
      </footer>
    </div>
  )
}
