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
  CheckCircle2
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
        if (!res.success) setError(res.error || 'Invalid email or password.')
        else onAuthenticated?.()
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Failed to create account.')
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
    <div className="min-h-screen bg-[#0f1012] text-[#f4f1eb] font-sans flex items-center justify-center p-4 selection:bg-brand-500/30 selection:text-brand-200">
      <div className="w-full max-w-md space-y-6">
        {/* ── Brand Logo Header ── */}
        <div className="text-center space-y-2">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-brand-500 text-[#1a1210] font-black shadow-md">
            <FolderOpen size={22} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white">
            Dedupe<span className="text-brand-400">IQ</span>
          </h1>
          <p className="text-xs text-slate-400">
            {mode === 'signin'
              ? 'Sign in to access your workspace'
              : mode === 'signup'
              ? 'Create a new local workspace'
              : 'Enter your email to reset password'}
          </p>
        </div>

        {/* ── Auth Card ── */}
        <div className="rounded-2xl border border-[#2a2e33] bg-[#16181b] p-7 space-y-5 shadow-xl">
          {/* Quick Demo Button */}
          <button
            type="button"
            onClick={handleInstantDemo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 py-2.5 px-4 text-xs font-bold text-[#1c110f] transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Zap size={14} className="fill-current" />
            <span>Instant Guest Demo</span>
            <ArrowRight size={14} />
          </button>

          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#24272c]" />
            </div>
            <span className="relative bg-[#16181b] px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500">
              or continue with email
            </span>
          </div>

          {/* Mode Switcher */}
          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#24272c] bg-[#111316] p-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setSuccessMessage(null)
                }}
                className={`rounded-lg py-2 font-bold transition-colors ${
                  mode === 'signin'
                    ? 'bg-[#202328] text-white shadow-sm'
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
                className={`rounded-lg py-2 font-bold transition-colors ${
                  mode === 'signup'
                    ? 'bg-[#202328] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}

          {/* Error / Success Alerts */}
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-200 flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full rounded-xl border border-[#272b32] bg-[#111215] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 block">Email Address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="alex.morgan@workspace.io"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#272b32] bg-[#111215] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold text-slate-300">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setError(null)
                      }}
                      className="text-[11px] text-brand-400 hover:underline"
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
                    className="w-full rounded-xl border border-[#272b32] bg-[#111215] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors font-mono"
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
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">Confirm Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-[#272b32] bg-[#111215] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'signin' && (
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-[#2a2e33] bg-[#111215] accent-brand-500 cursor-pointer"
                />
                <span>Remember this workspace</span>
              </label>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white hover:bg-slate-200 py-2.5 text-xs font-bold text-[#0f1012] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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

          {/* Quick preset credentials chips */}
          {mode === 'signin' && (
            <div className="pt-3 border-t border-[#24272c] space-y-2">
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-center">
                Quick Fill Test Accounts
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickUsers.map(u => (
                  <button
                    key={u.email}
                    type="button"
                    onClick={() => handleQuickSelect(u)}
                    className="flex items-center gap-2 rounded-xl border border-[#24272c] bg-[#121316] p-2 text-left hover:border-brand-500/40 hover:bg-[#1a1c21] transition-colors"
                  >
                    <div className="grid h-6 w-6 shrink-0 place-items-center rounded bg-brand-500/20 text-brand-300 font-mono font-bold text-[10px]">
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
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500 font-mono">
          DedupeIQ · 100% On-Device Processing
        </p>
      </div>
    </div>
  )
}
