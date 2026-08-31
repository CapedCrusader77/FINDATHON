import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  HardDrive,
  FileCheck,
  Zap,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button, Input, Card, Badge } from '../components/ui'

export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'signin') {
        const res = await login(email, password, rememberMe)
        if (!res.success) {
          setError(res.error || 'Authentication failed.')
        } else if (onAuthenticated) {
          onAuthenticated()
        }
      } else if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) {
          setError(res.error || 'Registration failed.')
        } else if (onAuthenticated) {
          onAuthenticated()
        }
      } else if (mode === 'forgot') {
        const res = await forgotPassword(email)
        if (!res.success) {
          setError(res.error || 'Password reset request failed.')
        } else {
          setSuccessMessage(res.message || 'Check your inbox for reset instructions.')
        }
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickDemo = async () => {
    setLoading(true)
    await login('alex.morgan@workspace.io', 'password123', true)
    setLoading(false)
    if (onAuthenticated) onAuthenticated()
  }

  return (
    <div className="min-h-screen bg-[#0c0e14] text-slate-100 flex flex-col justify-between selection:bg-brand-500/30 selection:text-brand-200">
      {/* Top Brand Bar */}
      <header className="flex h-16 items-center justify-between px-6 sm:px-10 border-b border-[#1e2230] bg-[#0c0e14]">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600/20 text-brand-400 border border-brand-500/30">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              Dedupe<span className="text-brand-400">IQ</span>
            </span>
            <span className="ml-2 text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Desktop Edition
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Local Engine · Zero Cloud Uploads</span>
        </div>
      </header>

      {/* Main Authentication Centerpiece */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Card className="p-7 sm:p-8 bg-[#11141d] border-[#222634] shadow-elevated">
            {/* Header / Tabs */}
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
                    className={`rounded-md py-1.5 font-semibold transition-all ${
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
                    className={`rounded-md py-1.5 font-semibold transition-all ${
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
                  <h2 className="text-base font-bold text-white">Reset Password</h2>
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

              <p className="mt-4 text-xs text-slate-400 leading-relaxed">
                {mode === 'signin' && 'Sign in to access your local duplicate index, active quarantine bins, and review queues.'}
                {mode === 'signup' && 'Register a local workspace profile to organize your directories and cluster duplicates safely.'}
                {mode === 'forgot' && 'Enter your verified email address to receive password recovery instructions.'}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {error && (
              <div className="mb-5 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mb-5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-3 text-slate-500" />
                    <Input
                      type="text"
                      placeholder="e.g. Alex Morgan"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-3 text-slate-500" />
                  <Input
                    type="email"
                    placeholder="name@workspace.io"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="pl-9"
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
                        className="text-[11px] text-brand-400 hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
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
                    <Lock size={15} className="absolute left-3 top-3 text-slate-500" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              )}

              {mode === 'signin' && (
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-[#272d3f] bg-[#0c0e14] text-brand-600 focus:ring-brand-500 cursor-pointer"
                    />
                    <span>Remember workspace session</span>
                  </label>
                </div>
              )}

              <div className="pt-2 space-y-2.5">
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs h-10 shadow-sm"
                >
                  {loading ? (
                    'Processing...'
                  ) : mode === 'signin' ? (
                    'Sign In to Workspace'
                  ) : mode === 'signup' ? (
                    'Create Workspace Account'
                  ) : (
                    'Send Reset Link'
                  )}
                  <ArrowRight size={14} />
                </Button>

                {mode === 'signin' && (
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handleQuickDemo}
                    className="w-full text-xs h-9 text-slate-300 hover:text-white"
                  >
                    <Zap size={13} className="text-brand-400" />
                    <span>Quick Guest Demo Access</span>
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-[#1e2230] bg-[#0c0e14] px-6 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>DedupeIQ Multi-Modal Storage Organizer v1.0.0</span>
        <span>Local Flask API & MongoDB Connected</span>
      </footer>
    </div>
  )
}
