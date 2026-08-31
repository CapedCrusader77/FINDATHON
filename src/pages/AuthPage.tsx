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
  X,
  Sliders,
  GitBranch,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  Play,
  RotateCcw,
  Info,
  Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()
  const navigate = useNavigate()

  // Navigation state: 'auth' or 'about'
  const [activeView, setActiveView] = useState<'auth' | 'about'>('auth')

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

  // Interactive About Showcase State
  const [selectedDemoIndex, setSelectedDemoIndex] = useState(0)
  const [simulatedSlider, setSimulatedSlider] = useState(50)
  const [activeStageTab, setActiveStageTab] = useState(0)
  const [sandboxResolved, setSandboxResolved] = useState(false)

  const demoComparisons = [
    {
      id: 'photo_demo',
      category: 'Perceptual Image Clustering',
      title: 'Vacation Photo (RAW) vs. WhatsApp Compressed Copy',
      similarity: 98,
      matchType: 'Near image',
      original: {
        name: 'IMG_8421.JPG',
        spec: '4032 × 3024 · 5.8 MB',
        badge: 'Recommended Master',
        desc: 'Camera original with full dynamic range and EXIF color depth.'
      },
      copy: {
        name: 'WhatsApp_IMG_8421.jpg',
        spec: '1280 × 960 · 431 KB',
        badge: 'Candidate for Quarantine',
        desc: 'Downscaled and recompressed with standard 85% JPEG quantization.'
      },
      whyMatch: [
        'Perceptual pHash structural match: 99%',
        'Consistent 4:3 camera aspect ratio',
        'Compression & downscaling artifacts identified'
      ],
      recoverable: '5.4 MB'
    },
    {
      id: 'doc_demo',
      category: 'Cross-Format Document Revisions',
      title: 'Project Proposal Draft vs. Final PDF Submission',
      similarity: 94,
      matchType: 'Near document',
      original: {
        name: 'Project_Proposal_Final_v2.pdf',
        spec: '28 Pages · 4.2 MB',
        badge: 'Recommended Master',
        desc: 'Complete compiled document with executive appendices and signatures.'
      },
      copy: {
        name: 'Project_Proposal_Draft.docx',
        spec: '26 Pages · 3.8 MB',
        badge: 'Candidate for Quarantine',
        desc: 'Pre-final revision with 94% text n-gram overlap.'
      },
      whyMatch: [
        'Text n-gram & sentence vector overlap: 94%',
        'Matching header hierarchy and table schemas',
        'Minor revisions in financial summary section'
      ],
      recoverable: '3.8 MB'
    },
    {
      id: 'exact_demo',
      category: 'Exact Cryptographic Duplicate',
      title: 'Architecture Blueprint in Separate Folders',
      similarity: 100,
      matchType: 'Exact',
      original: {
        name: 'system_architecture_diagram.png',
        spec: '3840 × 2160 · 18.4 MB',
        badge: 'Active Source File',
        desc: 'Original asset stored in /Projects/Architecture directory.'
      },
      copy: {
        name: 'system_architecture_diagram_copy.png',
        spec: '3840 × 2160 · 18.4 MB',
        badge: 'Candidate for Quarantine',
        desc: 'Redundant copy stored in /Downloads.'
      },
      whyMatch: [
        'Identical SHA-256 cryptographic byte hash',
        '100% bit-for-bit file parity',
        'Safe 1-click storage reclamation'
      ],
      recoverable: '18.4 MB'
    }
  ]

  const engineStages = [
    {
      step: '01',
      title: 'Local File Ingestion',
      subtitle: 'Zero Cloud Uploads',
      icon: HardDrive,
      color: 'from-blue-500 to-cyan-500',
      details: 'DedupeIQ recursively scans local directories without streaming files to third-party servers. Cryptographic SHA-256 fingerprints are generated directly on your CPU/GPU.'
    },
    {
      step: '02',
      title: 'Perceptual Feature Extraction',
      subtitle: 'dHash, pHash & NLP',
      icon: Cpu,
      color: 'from-purple-500 to-indigo-500',
      details: 'Images are evaluated using Discrete Cosine Transform (DCT) frequency analysis. Documents are normalized and vectorized with n-gram overlap algorithms.'
    },
    {
      step: '03',
      title: 'Louvain Graph Partitioning',
      subtitle: 'Modular Network Clusters',
      icon: Layers,
      color: 'from-brand-500 to-amber-500',
      details: 'Pairwise file distances form a weighted topological similarity graph. The Louvain modularity algorithm ($Q=0.88$) automatically groups related files into distinct communities.'
    },
    {
      step: '04',
      title: 'Master Recommendation & Quarantine',
      subtitle: 'Non-Destructive 30-Day Bin',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-500',
      details: 'Our decision engine evaluates resolution, bitrate, page completeness, and modification dates to recommend the optimal master file. Redundant copies are safely isolated.'
    }
  ]

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
        else onAuthenticated ? onAuthenticated() : navigate('/')
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
        else onAuthenticated ? onAuthenticated() : navigate('/')
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

  const currentComparison = demoComparisons[selectedDemoIndex]

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

      {/* ── 3. Top Navigation Header ── */}
      <header className="relative z-20 flex h-20 items-center justify-between px-6 sm:px-12 border-b border-[#1d202e] bg-[#090a0f]/80 backdrop-blur-md max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-bold shadow-glow">
            <FolderOpen size={20} strokeWidth={2.5} />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Dedupe<span className="text-brand-400">IQ</span>
            </span>
            <span className="ml-2.5 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[9.5px] font-mono text-emerald-300 hidden sm:inline-flex">
              <Lock size={10} className="text-emerald-400" />
              <span>On-Device Intelligence</span>
            </span>
          </div>
        </div>

        {/* View Switcher: Interactive About vs. Sign In */}
        <div className="flex items-center gap-3">
          <div className="grid grid-cols-2 rounded-2xl border border-[#262a3c] bg-[#11131c]/90 p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveView('auth')}
              className={`rounded-xl px-4 py-2 font-bold transition-all cursor-pointer ${
                activeView === 'auth'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setActiveView('about')}
              className={`rounded-xl px-4 py-2 font-bold transition-all cursor-pointer ${
                activeView === 'about'
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Interactive About
            </button>
          </div>

          <button
            type="button"
            onClick={handleInstantDemo}
            disabled={loading}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#1e2232] hover:bg-[#282d42] border border-[#30364e] px-4 py-2 text-xs font-bold text-white transition-all cursor-pointer"
          >
            <Zap size={14} className="fill-brand-400 text-brand-400" />
            <span>1-Click Demo</span>
          </button>
        </div>
      </header>

      {/* ── 4. Main Body: Switchable between Interactive About & Auth ── */}
      {activeView === 'about' ? (
        <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-6 sm:p-10 space-y-10">
          {/* Header Banner */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-bold text-brand-300 font-mono tracking-wide">
              <Sparkles size={14} />
              <span>How DedupeIQ Works · Interactive Engine Showcase</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-white tracking-tight leading-tight">
              Not just matching filenames. <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">
                Understanding what’s inside your files.
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Traditional tools say <em>"These files have different names, so they’re different."</em> DedupeIQ looks inside image pixels and document paragraphs to determine: <em>"These are all versions of the same file."</em>
            </p>
          </div>

          {/* Interactive Comparison Simulator */}
          <div className="rounded-3xl border border-[#262a3c] bg-[#11131c]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2333] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                  Interactive Simulator
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Live Duplicate Detection & Master Selection
                </h2>
              </div>

              {/* Sample Pair Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                {demoComparisons.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedDemoIndex(idx)
                      setSandboxResolved(false)
                    }}
                    className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedDemoIndex === idx
                        ? 'bg-brand-600 text-white shadow-glow'
                        : 'bg-[#181a24] text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.category.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Side-by-Side Visual Simulator Cards */}
            <div className="grid md:grid-cols-2 gap-6 items-stretch">
              {/* ORIGINAL MASTER CARD */}
              <div className="rounded-2xl border-2 border-emerald-500/40 bg-[#0c1813] p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    <Star size={11} className="fill-emerald-400 text-emerald-400" />
                    <span>{currentComparison.original.badge}</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-400">100% Quality</span>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-[#062014] p-6 text-center flex flex-col items-center justify-center min-h-[140px] space-y-2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                    {currentComparison.matchType === 'Near image' || currentComparison.matchType === 'Exact' ? (
                      <ImageIcon size={24} />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>
                  <p className="text-sm font-bold text-white truncate max-w-[260px]">
                    {currentComparison.original.name}
                  </p>
                  <p className="text-xs font-mono text-emerald-300">{currentComparison.original.spec}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#062014]/60 p-3 rounded-xl border border-emerald-500/20">
                  {currentComparison.original.desc}
                </p>

                <div className="py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck size={15} />
                  <span>Protected Master (Always Retained)</span>
                </div>
              </div>

              {/* CANDIDATE COPY CARD */}
              <div className="rounded-2xl border border-[#2a2e3c] bg-[#141622] p-5 flex flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-300 text-[10px] font-bold">
                    {currentComparison.copy.badge}
                  </span>
                  <span className="font-mono text-xs font-bold text-brand-400">
                    {currentComparison.similarity}% Match
                  </span>
                </div>

                <div className="rounded-xl border border-[#262a3c] bg-[#0c0e14] p-6 text-center flex flex-col items-center justify-center min-h-[140px] space-y-2">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.06] text-slate-400">
                    {currentComparison.matchType === 'Near image' || currentComparison.matchType === 'Exact' ? (
                      <ImageIcon size={24} />
                    ) : (
                      <FileText size={24} />
                    )}
                  </div>
                  <p className="text-sm font-bold text-white truncate max-w-[260px]">
                    {currentComparison.copy.name}
                  </p>
                  <p className="text-xs font-mono text-slate-400">{currentComparison.copy.spec}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-[#0c0e14] p-3 rounded-xl border border-[#262a3c]">
                  {currentComparison.copy.desc}
                </p>

                <div>
                  {sandboxResolved ? (
                    <div className="py-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={15} />
                      <span>Staged into 30-Day Safe Quarantine Bin</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSandboxResolved(true)}
                      className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/35 text-xs font-bold text-center transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Zap size={14} />
                      <span>Test Quarantine ({currentComparison.recoverable} Recoverable)</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Why They Match Signals List */}
            <div className="rounded-2xl border border-[#1f2333] bg-[#0c0e14] p-4.5 space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                Why DedupeIQ Matched This Pair:
              </p>
              <div className="grid sm:grid-cols-3 gap-2 text-xs">
                {currentComparison.whyMatch.map((reason, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl bg-[#141622] p-2.5 border border-[#222636]">
                    <Check size={12} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                    <span className="text-slate-300 text-[11px] font-medium">{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4-Stage Engine Pipeline Architecture */}
          <div className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold font-display text-white">
                The 4-Stage Intelligence Pipeline
              </h2>
              <p className="text-xs text-slate-400">
                Click any stage below to inspect the mathematical and cryptographic operations performed locally on your device.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {engineStages.map((stage, idx) => {
                const Icon = stage.icon
                const isActive = activeStageTab === idx
                return (
                  <button
                    key={stage.step}
                    type="button"
                    onClick={() => setActiveStageTab(idx)}
                    className={`rounded-2xl border p-5 text-left transition-all cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'border-brand-500/60 bg-[#161928] shadow-glow scale-[1.02]'
                        : 'border-[#222636] bg-[#11131c]/90 hover:border-slate-500 hover:bg-[#141724]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-bold text-brand-400">
                        {stage.step}
                      </span>
                      <div className={`grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br ${stage.color} text-white shadow-sm`}>
                        <Icon size={16} />
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white">{stage.title}</h3>
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5">{stage.subtitle}</p>
                    <p className="text-xs text-slate-300 mt-3 leading-relaxed border-t border-[#1f2333] pt-2.5">
                      {stage.details}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Call to Action Bar */}
          <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 via-[#11131c] to-indigo-950/40 p-8 text-center sm:flex sm:items-center sm:justify-between gap-6 shadow-2xl">
            <div className="text-left space-y-1">
              <h3 className="text-xl font-bold text-white font-display">
                Ready to clean up your workspace?
              </h3>
              <p className="text-xs text-slate-400">
                Experience on-device duplicate detection with instant demo profiles or your personal folders.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setActiveView('auth')}
                className="rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 px-6 py-3.5 text-sm font-bold text-white transition-all shadow-glow cursor-pointer"
              >
                <span>Sign In to Workspace</span>
              </button>
              <button
                type="button"
                onClick={handleInstantDemo}
                className="rounded-2xl bg-[#1e2232] hover:bg-[#282d42] border border-[#30364e] px-6 py-3.5 text-sm font-bold text-white transition-all cursor-pointer"
              >
                <span>Launch Demo</span>
              </button>
            </div>
          </div>
        </main>
      ) : (
        /* ── Main Split-Screen Asymmetric Area ── */
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
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  The DedupeIQ Intelligence Workflow
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView('about')}
                  className="text-[11px] font-bold text-brand-400 hover:underline flex items-center gap-1"
                >
                  <span>Interactive Engine Tour</span>
                  <ArrowRight size={12} />
                </button>
              </div>
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
                  className="w-full rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 py-3.5 px-6 text-sm font-bold text-white transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-glow mt-3 active:scale-[0.98]"
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
                  {!loading && <ArrowRight size={16} />}
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
                    Quick Test Credentials
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
      )}

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#1d202e] bg-[#090a0f] py-4 px-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white">DedupeIQ</span>
          <span>·</span>
          <span>Intelligent File Deduplication Workstation</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveView(activeView === 'about' ? 'auth' : 'about')}
            className="text-brand-400 hover:underline font-bold"
          >
            {activeView === 'about' ? 'Switch to Sign In' : 'Interactive About & Architecture Tour'}
          </button>
          <span className="font-mono text-slate-600">FINDATHON 2026</span>
        </div>
      </footer>
    </div>
  )
}
