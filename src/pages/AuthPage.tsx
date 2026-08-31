import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
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
  ShieldCheck,
  Sparkles,
  Layers,
  Cpu,
  HardDrive,
  FileCheck,
  Check,
  X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: 'bg-slate-700' }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    if (score <= 2) return { score: 1, label: 'Weak', color: 'bg-rose-500' }
    if (score <= 3) return { score: 2, label: 'Fair', color: 'bg-amber-500' }
    if (score <= 4) return { score: 3, label: 'Good', color: 'bg-blue-500' }
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' }
  }, [password])

  const quickUsers = [
    { name: 'Alex Morgan', role: 'Admin (Full Dataset)', email: 'alex.morgan@workspace.io', pass: 'password123', initials: 'AM' },
    { name: 'Jordan Lee', role: 'Vision Analyst', email: 'jordan.lee@storage.dev', pass: 'analyst2026', initials: 'JL' }
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
    onAuthenticated ? onAuthenticated() : navigate('/')
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setLoading(false)
    onAuthenticated ? onAuthenticated() : navigate('/')
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
        else {
          onAuthenticated ? onAuthenticated() : navigate('/')
        }
      } else if (mode === 'signup') {
        if (!termsAccepted) {
          setError('Please accept the Terms of Service and Privacy Policy.')
          setLoading(false)
          return
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Failed to create account.')
        else {
          onAuthenticated ? onAuthenticated() : navigate('/')
        }
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
    <div className="relative min-h-screen w-full bg-[#090a0f] text-[#f3f4f8] font-sans flex flex-col justify-between selection:bg-brand-600/30 selection:text-brand-300 overflow-x-hidden">
      {/* ── 1. Full-Bleed Ambient Background Video ── */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="fixed inset-0 z-0 h-full w-full object-cover scale-105 pointer-events-none opacity-40"
        src="/assets/background_video.mp4"
      />

      {/* ── 2. Cinematic Vignette Overlay ── */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(9,10,15,0.45) 0%, rgba(9,10,15,0.85) 75%, #090a0f 100%),
            linear-gradient(to top, rgba(9,10,15,0.95) 0%, rgba(9,10,15,0.4) 50%, rgba(9,10,15,0.9) 100%)
          `
        }}
      />

      {/* ── Top Bar ── */}
      <header className="relative z-20 flex h-16 items-center justify-between px-6 sm:px-12 border-b border-[#1d202e] bg-[#090a0f]/80 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-bold shadow-glow">
            <FolderOpen size={16} strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Dedupe<span className="text-brand-400">IQ</span>
          </span>
          <span className="ml-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-mono text-emerald-300 hidden sm:inline-block">
            🔒 On-Device Intelligence
          </span>
        </div>

        <button
          type="button"
          onClick={handleInstantDemo}
          disabled={loading}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-glow cursor-pointer disabled:opacity-50"
        >
          <Zap size={13} className="fill-white" />
          <span>Launch Demo Workspace</span>
        </button>
      </header>

      {/* ── Main Split-Screen Asymmetric Area ── */}
      <main className="relative z-10 flex-1 grid lg:grid-cols-[1.1fr_0.9fr] max-w-7xl w-full mx-auto p-6 sm:p-10 gap-10 items-center">
        {/* Left Column: Product Value & Workflow Narrative */}
        <div className="hidden lg:flex flex-col justify-center space-y-7 pr-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3.5 py-1 text-xs font-semibold text-brand-300">
              <Sparkles size={13} />
              <span>Multi-Modal Intelligent Duplicate Workstation</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black font-display text-white tracking-tight leading-[1.15]">
              Intelligent duplicate discovery & <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 to-indigo-400">safe storage cleanup</span>.
            </h1>

            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Unlike traditional tools that only compare exact filenames or byte hashes, DedupeIQ inspects image pixels, perceptual frequencies, and cross-format document texts to group versions and recommend the safest master copy to retain.
            </p>
          </div>

          {/* 6-Step Core Workflow Strip */}
          <div className="space-y-2 pt-2 border-t border-[#1d202e]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              The DedupeIQ Intelligence Workflow
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { step: '01 SCAN', desc: 'Local folder discovery' },
                { step: '02 DETECT', desc: 'pHash & NLP vector diff' },
                { step: '03 EXPLAIN', desc: 'Signal & reason breakdown' },
                { step: '04 RECOMMEND', desc: 'Optimal master copy pick' },
                { step: '05 REVIEW', desc: 'Side-by-side verification' },
                { step: '06 QUARANTINE', desc: '30-day soft safe bin' }
              ].map(w => (
                <div key={w.step} className="rounded-xl border border-[#1f2333] bg-[#11131c] p-2.5 space-y-0.5">
                  <p className="font-mono text-[10px] font-bold text-brand-400">{w.step}</p>
                  <p className="text-[10px] text-slate-400 leading-tight">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* On-Device Privacy Guarantee Card */}
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-4 flex items-start gap-3">
            <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-0.5">
              <p className="font-bold text-emerald-300">100% Local-First Processing Guarantee</p>
              <p className="text-emerald-200/80 leading-relaxed text-[11px]">
                Zero files, embeddings, or metadata leave your local machine. All analysis runs directly on your hardware.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Premium Auth Card */}
        <div className="w-full max-w-[460px] mx-auto">
          <div className="rounded-3xl border border-[#262a3c] bg-[#11131c]/90 backdrop-blur-2xl p-7 sm:p-9 shadow-2xl space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold font-display text-white tracking-tight">
                {mode === 'signin' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset password'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {mode === 'signin'
                  ? 'Sign in to access your local file intelligence workspace.'
                  : mode === 'signup'
                  ? 'Start scanning and organizing your duplicate files.'
                  : 'Enter your email address to receive reset instructions.'}
              </p>
            </div>

            {/* Google Sign-In UI Option */}
            {mode !== 'forgot' && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-[#2a2e40] bg-[#161924] hover:bg-[#1e2232] hover:border-slate-500 py-2.5 px-4 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.7 0 3 .6 4 1.5l3-3C17.2 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9c0-.2 0-.3 0-.4z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            )}

            {mode !== 'forgot' && (
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#222636]" />
                </div>
                <span className="relative bg-[#11131c] px-3 text-[10px] uppercase tracking-wider font-semibold text-slate-500 font-mono">
                  or with workspace email
                </span>
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
                      placeholder="Alex Morgan"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-xl border border-[#262a3c] bg-[#161924] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-[#1b1f2e] transition-colors"
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
                    className="w-full rounded-xl border border-[#262a3c] bg-[#161924] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-[#1b1f2e] transition-colors"
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
                        className="text-[10.5px] text-brand-400 hover:underline"
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
                      className="w-full rounded-xl border border-[#262a3c] bg-[#161924] pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-[#1b1f2e] transition-colors font-mono"
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

                  {/* Dynamic Password Strength Indicator for Signup */}
                  {mode === 'signup' && password && (
                    <div className="pt-1.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength:</span>
                        <span className="font-semibold text-slate-300">{passwordStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1 h-1">
                        {[1, 2, 3, 4].map(step => (
                          <div
                            key={step}
                            className={`rounded-full h-full transition-all ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-[#262a3c]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
                      className="w-full rounded-xl border border-[#262a3c] bg-[#161924] pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 focus:bg-[#1b1f2e] transition-colors font-mono"
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
                    className="h-3.5 w-3.5 rounded border-[#262a3c] bg-[#161924] accent-brand-600 cursor-pointer"
                  />
                  <span>Remember this workspace session</span>
                </label>
              )}

              {mode === 'signup' && (
                <label className="flex items-start gap-2 text-[11px] text-slate-400 cursor-pointer select-none pt-0.5">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={e => setTermsAccepted(e.target.checked)}
                    className="h-3.5 w-3.5 mt-0.5 rounded border-[#262a3c] bg-[#161924] accent-brand-600 cursor-pointer"
                  />
                  <span>I accept the Terms of Service and local privacy policy</span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 py-3 text-xs font-bold text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow mt-2"
              >
                <span>
                  {loading
                    ? 'Processing...'
                    : mode === 'signin'
                    ? 'Sign In to Workspace'
                    : mode === 'signup'
                    ? 'Create Workspace Account'
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

            {/* Quick Test Profiles for Evaluators */}
            {mode === 'signin' && (
              <div className="pt-3 border-t border-[#222636] space-y-2">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider text-center font-mono">
                  Quick-Fill Evaluator Profiles
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickUsers.map(u => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className="flex items-center gap-2 rounded-xl border border-[#262a3c] bg-[#161924] p-2 text-left hover:border-brand-500/50 hover:bg-[#1b1f2e] transition-all cursor-pointer"
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

            {/* Mode Switcher Toggle */}
            <div className="pt-1 text-center text-xs text-slate-400 border-t border-[#222636]">
              {mode === 'signin' ? (
                <p>
                  Don't have a workspace?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup')
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className="font-bold text-brand-400 hover:underline ml-1"
                  >
                    Sign up now
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin')
                      setError(null)
                      setSuccessMessage(null)
                    }}
                    className="font-bold text-brand-400 hover:underline ml-1"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#1d202e] bg-[#090a0f] py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
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
