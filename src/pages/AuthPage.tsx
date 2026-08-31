import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Music,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  GitBranch,
  Cpu,
  Layers,
  HardDrive,
  Check,
  ChevronRight,
  Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/* ── Interactive Demo Scenarios ── */
const SCENARIOS = [
  {
    id: 'photos',
    tab: '📸 Camera Bursts & WhatsApp',
    title: 'Visual Photo Compression Cluster',
    type: 'Perceptual pHash (Hamming Distance ≤ 6)',
    similarity: 98,
    recoverable: '6.4 MB',
    whyMaster: 'Highest sensor resolution (4032×3024) and original uncompressed EXIF camera metadata preserved.',
    files: [
      {
        name: 'IMG_2026_RAW_0942.jpg',
        size: '4.8 MB',
        specs: '4032 × 3024 · 24-bit RGB',
        tag: 'Original 4K Camera',
        isMaster: true,
        reason: 'Master file: retains dynamic range'
      },
      {
        name: 'IMG-WA0042_sent.jpg',
        size: '420 KB',
        specs: '1600 × 1200 · 82% quality',
        tag: 'WhatsApp Re-compressed',
        isMaster: false,
        reason: 'Discardable recompression'
      },
      {
        name: 'IMG_2026_0942_square.jpg',
        size: '1.2 MB',
        specs: '2048 × 2048 · Center Crop',
        tag: 'Social Media Crop',
        isMaster: false,
        reason: 'Derivative cropped copy'
      },
      {
        name: 'thumb_IMG_0942.jpg',
        size: '180 KB',
        specs: '800 × 600 · Cache file',
        tag: 'OS Thumbnail Cache',
        isMaster: false,
        reason: 'Redundant cache preview'
      }
    ]
  },
  {
    id: 'docs',
    tab: '📄 Document Versions & Formats',
    title: 'Cross-Format Document Revision Chain',
    type: 'Normalized NLP Vector Embedding (Cosine Sim ≥ 0.94)',
    similarity: 95,
    recoverable: '380 KB',
    whyMaster: 'Contains final signed revisions, all 12 sections intact, and the most recent modification timestamp.',
    files: [
      {
        name: 'Q3_Financial_Review_v1.docx',
        size: '28 KB',
        specs: '4 pages · Draft 1',
        tag: 'Initial Draft',
        isMaster: false,
        reason: 'Superseded by v3'
      },
      {
        name: 'Q3_Financial_Review_v2_edits.docx',
        size: '42 KB',
        specs: '7 pages · Added balance sheet',
        tag: 'Team Edits',
        isMaster: false,
        reason: 'Superseded by final'
      },
      {
        name: 'Q3_Financial_Review_Final.docx',
        size: '64 KB',
        specs: '12 pages · All tables complete',
        tag: 'Final Approved Master',
        isMaster: true,
        reason: 'Master file: newest & most complete'
      },
      {
        name: 'Q3_Financial_Review_Export.pdf',
        size: '310 KB',
        specs: '12 pages · Rasterized PDF export',
        tag: 'PDF Render',
        isMaster: false,
        reason: 'Export copy of Final.docx'
      }
    ]
  },
  {
    id: 'audio',
    tab: '🎧 Audio & Media Stems',
    title: 'Multi-Bitrate Audio Transcode Group',
    type: 'Chromaprint Acoustic Fingerprint',
    similarity: 99,
    recoverable: '492 MB',
    whyMaster: 'Lossless 24-bit 48kHz WAV container with unclipped frequency response up to 24kHz.',
    files: [
      {
        name: 'Master_Recording_Take4.wav',
        size: '450 MB',
        specs: '24-bit / 48kHz Lossless PCM',
        tag: 'Studio Studio Master',
        isMaster: true,
        reason: 'Master file: pristine source audio'
      },
      {
        name: 'Master_Recording_320k.mp3',
        size: '32 MB',
        specs: '320 kbps CBR MP3',
        tag: 'High-Bitrate MP3',
        isMaster: false,
        reason: 'Lossy transcode of WAV'
      },
      {
        name: 'Master_VoiceNote_share.m4a',
        size: '10 MB',
        specs: '128 kbps AAC Mono',
        tag: 'Voice Memo Export',
        isMaster: false,
        reason: 'Low-bitrate share copy'
      }
    ]
  }
]

export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()

  // Scenario playground state
  const [activeScenario, setActiveScenario] = useState(SCENARIOS[0])
  const [sensitivity, setSensitivity] = useState(85)

  // Auth form state
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
    { name: 'Jordan Lee', role: 'Vision Analyst', email: 'jordan.lee@storage.dev', pass: 'analyst2026', initials: 'JL' }
  ]

  const handleQuickSelect = (userItem: typeof quickUsers[0]) => {
    setEmail(userItem.email)
    setPassword(userItem.pass)
    setError(null)
  }

  const handleInstantGuestDemo = async () => {
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
        else setSuccessMessage(res.message || 'Check your inbox for reset instructions.')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f1012] text-[#f4f1eb] font-sans selection:bg-brand-500/30 selection:text-brand-200 flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#24272c] bg-[#141619]/90 px-6 sm:px-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-[#1a1210] font-black text-xs shadow-sm">
            <FolderOpen size={15} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-white">
              Dedupe<span className="text-brand-400">IQ</span>
            </span>
            <span className="ml-2 rounded border border-[#2e3238] bg-[#1a1c20] px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-slate-400">
              On-Device Intelligence
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Local Neural Sandbox</span>
          </div>
          <button
            onClick={handleInstantGuestDemo}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 hover:bg-brand-400 px-3 py-1.5 text-xs font-bold text-[#1e1110] transition-colors cursor-pointer disabled:opacity-50"
          >
            <Zap size={13} className="fill-current" />
            <span>Enter Demo Workspace</span>
          </button>
        </div>
      </header>

      {/* ── Main Two-Column Layout ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 grid lg:grid-cols-[1.25fr_0.75fr] gap-8 items-start">
        {/* ── Left Column: Problem, Analogy & Interactive Engine Playground ── */}
        <div className="space-y-6">
          {/* Header Context */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-3 py-1 text-[11px] font-semibold text-brand-300">
              <Sparkles size={12} />
              <span>Multi-Modal Near-Duplicate Clustering</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-display leading-[1.15]">
              Find files that are exactly the same — or <span className="text-brand-400">basically the same</span>.
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Standard tools only check exact bytes. DedupeIQ looks <em>inside</em> files — comparing image pixels, document text, and media containers — to identify duplicates, recommend the safest copy to keep, and safely reclaim storage.
            </p>
          </div>

          {/* ── Interactive Playground Card ── */}
          <div className="rounded-2xl border border-[#2a2e33] bg-[#16181b] p-5 sm:p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#24272c] pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                  Live Engine Simulation
                </p>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  See how files are clustered & evaluated
                </h3>
              </div>

              {/* Scenario Switcher Tabs */}
              <div className="flex flex-wrap gap-1.5">
                {SCENARIOS.map(scenario => (
                  <button
                    key={scenario.id}
                    onClick={() => setActiveScenario(scenario)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
                      activeScenario.id === scenario.id
                        ? 'bg-brand-500 text-[#1e1110]'
                        : 'bg-[#1e2126] text-slate-300 hover:bg-[#252830] hover:text-white border border-[#2a2e33]'
                    }`}
                  >
                    {scenario.tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Scenario Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div>
                <p className="font-bold text-white text-xs">{activeScenario.title}</p>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5">{activeScenario.type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded bg-brand-500/15 border border-brand-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-brand-300">
                  {activeScenario.similarity}% Match
                </span>
                <span className="rounded bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
                  +{activeScenario.recoverable} recoverable
                </span>
              </div>
            </div>

            {/* Candidate Files in this Group */}
            <div className="space-y-2">
              {activeScenario.files.map((file, idx) => (
                <div
                  key={file.name}
                  className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                    file.isMaster
                      ? 'border-emerald-500/40 bg-emerald-950/20'
                      : 'border-[#24272c] bg-[#121316]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                        file.isMaster
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-[#1c1f24] text-slate-400'
                      }`}
                    >
                      {activeScenario.id === 'photos' ? (
                        <ImageIcon size={15} />
                      ) : activeScenario.id === 'docs' ? (
                        <FileText size={15} />
                      ) : (
                        <Music size={15} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                        {file.isMaster ? (
                          <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 shrink-0">
                            ★ KEEP MASTER
                          </span>
                        ) : (
                          <span className="rounded bg-[#202328] border border-[#2a2e33] px-1.5 py-0.5 text-[9px] text-slate-400 shrink-0">
                            {file.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{file.specs}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p className="font-mono text-xs font-bold text-white">{file.size}</p>
                    <p
                      className={`text-[9px] ${
                        file.isMaster ? 'text-emerald-400 font-semibold' : 'text-slate-500'
                      }`}
                    >
                      {file.isMaster ? 'Safest to retain' : 'Staged for clean'}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Why Keep Banner */}
            <div className="rounded-xl border border-emerald-500/25 bg-emerald-950/15 p-3 flex items-start gap-2.5">
              <ShieldCheck size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-emerald-300">Intelligent Recommendation: </span>
                <span className="text-emerald-200/90 leading-relaxed">
                  {activeScenario.whyMaster}
                </span>
              </div>
            </div>
          </div>

          {/* ── 4-Stage Detection Specs ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { title: '1. SHA-256 Pass', desc: 'Exact bit-level clones', tag: 'Instant' },
              { title: '2. Perceptual Vision', desc: 'pHash & Hamming dist', tag: 'Visual' },
              { title: '3. NLP Semantic', desc: 'DOCX ↔ PDF text overlap', tag: 'Contextual' },
              { title: '4. Graph Clusters', desc: 'Louvain master picking', tag: 'Grouping' },
            ].map(stage => (
              <div
                key={stage.title}
                className="rounded-xl border border-[#24272c] bg-[#141619] p-3 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-white">{stage.title}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">{stage.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Column: Clean Workspace Access & Auth ── */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#2a2e33] bg-[#16181b] p-6 space-y-6 shadow-sm">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                  Workspace Session
                </span>
                <span className="text-[10px] text-slate-500 font-mono">v1.2 Local Engine</span>
              </div>
              <h2 className="text-base font-bold text-white mt-1 font-display">
                {mode === 'signin'
                  ? 'Sign in to Workspace'
                  : mode === 'signup'
                  ? 'Create Local Workspace'
                  : 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {mode === 'signin'
                  ? 'Open your isolated deduplication catalog.'
                  : mode === 'signup'
                  ? 'Get a fresh isolated file index.'
                  : 'Enter your email to receive recovery instructions.'}
              </p>
            </div>

            {/* Instant Demo Launch Button */}
            <button
              type="button"
              onClick={handleInstantGuestDemo}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 hover:bg-brand-400 py-3 text-xs font-bold text-[#1c110f] transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Zap size={14} className="fill-current" />
              <span>One-Click Guest Demo (Preloaded Data)</span>
              <ArrowRight size={14} />
            </button>

            {/* Quick Profile Chips */}
            {mode === 'signin' && (
              <div className="space-y-2 pt-1 border-t border-[#24272c]">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or pick a preset account:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickUsers.map(u => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => handleQuickSelect(u)}
                      className="flex items-center gap-2 rounded-lg border border-[#24272c] bg-[#121316] p-2 text-left hover:border-brand-500/40 hover:bg-[#1a1c21] transition-colors"
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

            {/* Mode Selector Tabs */}
            {mode !== 'forgot' && (
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#24272c] bg-[#111316] p-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin')
                    setError(null)
                    setSuccessMessage(null)
                  }}
                  className={`rounded-lg py-1.5 font-bold transition-colors ${
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
                  className={`rounded-lg py-1.5 font-bold transition-colors ${
                    mode === 'signup'
                      ? 'bg-[#202328] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Notifications */}
            {error && (
              <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-200 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {successMessage && (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-200 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Full Name</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full rounded-lg border border-[#272b32] bg-[#111215] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="email"
                    placeholder="alex.morgan@workspace.io"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-[#272b32] bg-[#111215] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
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
                        className="text-[10px] text-brand-400 hover:underline"
                      >
                        Forgot?
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
                      className="w-full rounded-lg border border-[#272b32] bg-[#111215] pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
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
                    <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full rounded-lg border border-[#272b32] bg-[#111215] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors font-mono"
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
                    className="h-3.5 w-3.5 rounded border-[#2a2e33] bg-[#111215] accent-brand-500"
                  />
                  <span>Remember this session</span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#202328] hover:bg-[#282c33] border border-[#2e333a] py-2.5 text-xs font-bold text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>
                  {loading
                    ? 'Authenticating...'
                    : mode === 'signin'
                    ? 'Sign In to Workspace'
                    : mode === 'signup'
                    ? 'Register New Workspace'
                    : 'Send Password Reset Link'}
                </span>
                {!loading && <ChevronRight size={14} />}
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
          </div>

          {/* Privacy Footnote */}
          <div className="rounded-xl border border-[#202328] bg-[#121316] p-3 text-[11px] text-slate-400 flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
            <span>
              100% on-device processing. No files, embeddings, or metadata leave your local machine.
            </span>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#202328] bg-[#101114] py-4 px-6 text-center text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span>DedupeIQ · Intelligent File Deduplication Workstation</span>
        <span className="font-mono">FINDATHON 2026</span>
      </footer>
    </div>
  )
}
