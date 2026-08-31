import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ChevronDown,
  ChevronRight,
  HardDrive,
  Layers,
  Cpu,
  FileText,
  Image as ImageIcon,
  Check,
  X
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AuthPage({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const { login, signup, forgotPassword } = useAuth()

  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Interactive Hero Preview State
  const [activePreviewTab, setActivePreviewTab] = useState<'photos' | 'docs' | 'audio'>('photos')

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const quickUsers = [
    { name: 'Alex Morgan', role: 'Admin (Preloaded)', email: 'alex.morgan@workspace.io', pass: 'password123', initials: 'AM' },
    { name: 'Jordan Lee', role: 'Analyst (Preloaded)', email: 'jordan.lee@storage.dev', pass: 'analyst2026', initials: 'JL' }
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (authMode === 'signin') {
        const res = await login(email, password, rememberMe)
        if (!res.success) setError(res.error || 'Incorrect email or password.')
        else {
          setAuthModalOpen(false)
          onAuthenticated?.()
        }
      } else if (authMode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.')
          setLoading(false)
          return
        }
        const res = await signup(name, email, password)
        if (!res.success) setError(res.error || 'Unable to create account.')
        else {
          setAuthModalOpen(false)
          onAuthenticated?.()
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

  const faqs = [
    {
      q: 'How does DedupeIQ detect duplicates that have different filenames and resolutions?',
      a: 'DedupeIQ uses perceptual hashing (pHash, dHash, and wHash). It computes a 64-bit visual fingerprint of image structure and frequency, allowing it to detect identical photos even after resizing, Instagram/WhatsApp compression, center cropping, or minor color grading.'
    },
    {
      q: 'Can it compare Word documents (.docx) with PDF exports?',
      a: 'Yes. DedupeIQ extracts normalized text streams from DOCX, PDF, TXT, and Markdown files, then computes character n-gram overlap and semantic embedding cosine similarity. It recognizes when a PDF is an exported version of an earlier DOCX draft.'
    },
    {
      q: 'Are any files, hashes, or text sent to the cloud?',
      a: 'No. DedupeIQ runs 100% locally on your machine. All SHA-256 hashing, perceptual vision transforms, and NLP embeddings are computed in local sandboxed memory. Zero telemetry or file data leaves your device.'
    },
    {
      q: 'What happens when I quarantine a file?',
      a: 'Quarantined files are moved to a non-destructive local staging bin with a 30-day safety retention period. You can restore any file with one click at any time, or permanently wipe them when you are confident.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#08090b] text-[#f4f1eb] font-sans antialiased selection:bg-brand-500/30 selection:text-brand-200">
      {/* ── 1. Announcement Banner ── */}
      <div className="border-b border-white/[0.08] bg-[#0e1014] py-2 px-4 text-center text-xs text-slate-300">
        <div className="flex items-center justify-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>On-Device Neural Deduplication Engine</span>
          <span className="text-slate-600">·</span>
          <button
            onClick={handleInstantDemo}
            className="font-semibold text-brand-400 hover:underline cursor-pointer"
          >
            Launch Instant Demo Workspace →
          </button>
        </div>
      </div>

      {/* ── 2. Level2-Style Rounded Navigation Bar ── */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#08090b]/80 backdrop-blur-xl px-6 md:px-12 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-brand-500 text-[#1a1210] font-black shadow-[0_0_16px_rgba(248,117,103,0.35)]">
              <FolderOpen size={18} strokeWidth={2.5} />
            </div>
            <span className="font-display font-black text-xl tracking-tight text-white">
              Dedupe<span className="text-brand-400">IQ</span>
            </span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#pipeline" className="hover:text-white transition-colors">Architecture</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthMode('signin')
                setAuthModalOpen(true)
              }}
              className="px-5 py-2 rounded-full text-xs font-bold text-white hover:text-brand-300 transition-colors cursor-pointer"
            >
              Log in
            </button>
            <button
              onClick={handleInstantDemo}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-[#e05648] hover:from-brand-400 hover:to-brand-500 px-5 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(248,117,103,0.35)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap size={13} className="fill-white" />
              <span>Instant Demo</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── 3. Level2-Style Hero Section ── */}
      <section className="relative pt-16 pb-20 px-6 overflow-hidden">
        {/* Subtle Ambient Radial Lighting */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[900px] rounded-full bg-brand-500/[0.08] blur-[120px]" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#12141a] px-4 py-1.5 text-xs text-slate-300 shadow-sm">
            <span className="font-semibold text-brand-400">100% Local Processing</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Zero Cloud Uploads</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-white leading-[1.1]">
            See Your Files.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-brand-400 to-emerald-400">
              Clean with Clarity.
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            DedupeIQ is the fastest and most intelligent way to identify exact clones, burst camera photos, and cross-format document revisions — turning messy storage into clean space without writing a single script.
          </p>

          {/* CTA Group */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleInstantDemo}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 via-brand-600 to-[#e05648] hover:from-brand-400 hover:to-brand-500 px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(248,117,103,0.4)] transition-all cursor-pointer disabled:opacity-50"
            >
              <Zap size={16} className="fill-white" />
              <span>Launch Live Workspace</span>
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => {
                setAuthMode('signin')
                setAuthModalOpen(true)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] px-7 py-3.5 text-sm font-semibold text-white transition-all cursor-pointer"
            >
              <span>Sign In with Account</span>
            </button>
          </div>
        </div>

        {/* ── 4. Level2-Style Laptop / Workspace Interactive Showcase Frame ── */}
        <div id="demo" className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/[0.12] bg-[#101217]/90 p-4 sm:p-7 shadow-[0_30px_90px_rgba(0,0,0,0.8)] backdrop-blur-2xl space-y-5">
            {/* Top Bar inside showcase frame */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-xs font-mono font-bold text-slate-300">
                  DedupeIQ Interactive Cluster Inspector
                </span>
              </div>

              {/* Showcase Tab Selector */}
              <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-[#171920] p-1 text-xs">
                <button
                  onClick={() => setActivePreviewTab('photos')}
                  className={`rounded-full px-3.5 py-1 font-semibold transition-colors ${
                    activePreviewTab === 'photos'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📸 Photo Cluster
                </button>
                <button
                  onClick={() => setActivePreviewTab('docs')}
                  className={`rounded-full px-3.5 py-1 font-semibold transition-colors ${
                    activePreviewTab === 'docs'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  📄 Document Versions
                </button>
                <button
                  onClick={() => setActivePreviewTab('audio')}
                  className={`rounded-full px-3.5 py-1 font-semibold transition-colors ${
                    activePreviewTab === 'audio'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🎧 Media Stems
                </button>
              </div>
            </div>

            {/* Showcase Tab Content */}
            {activePreviewTab === 'photos' && (
              <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-4 items-center">
                <div className="space-y-2.5">
                  {[
                    { name: 'IMG_2026_RAW_0942.jpg', size: '4.8 MB', specs: '4032 × 3024 · 24-bit RGB', tag: '★ Master Photo', isMaster: true },
                    { name: 'IMG-WA0042_sent.jpg', size: '420 KB', specs: '1600 × 1200 · WhatsApp recompress', tag: 'Compressed Copy', isMaster: false },
                    { name: 'thumb_IMG_0942.jpg', size: '180 KB', specs: '800 × 600 · Cache thumbnail', tag: 'Cache File', isMaster: false }
                  ].map(file => (
                    <div
                      key={file.name}
                      className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                        file.isMaster
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : 'border-white/[0.08] bg-[#14171e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`grid h-8 w-8 place-items-center rounded-lg ${file.isMaster ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-slate-400'}`}>
                          <ImageIcon size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{file.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${file.isMaster ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                              {file.tag}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{file.specs}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{file.size}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck size={16} />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Algorithm Rationale</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Retaining 4K Raw Master</h4>
                  <p className="text-emerald-200/80 leading-relaxed text-xs">
                    Perceptual pHash detected a 98% visual match. The RAW copy preserves complete sensor dynamic range and uncompressed camera EXIF metadata.
                  </p>
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                    <span className="text-slate-400">Reclaimable Storage:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">6.4 MB (64%)</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'docs' && (
              <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-4 items-center">
                <div className="space-y-2.5">
                  {[
                    { name: 'Q3_Financial_Review_v1.docx', size: '28 KB', specs: '4 pages · Initial draft', tag: 'Draft', isMaster: false },
                    { name: 'Q3_Financial_Review_Final.docx', size: '64 KB', specs: '12 pages · All tables complete', tag: '★ Final Master', isMaster: true },
                    { name: 'Q3_Financial_Review_Export.pdf', size: '310 KB', specs: '12 pages · Rasterized PDF render', tag: 'PDF Render', isMaster: false }
                  ].map(file => (
                    <div
                      key={file.name}
                      className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                        file.isMaster
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : 'border-white/[0.08] bg-[#14171e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`grid h-8 w-8 place-items-center rounded-lg ${file.isMaster ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-slate-400'}`}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{file.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${file.isMaster ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                              {file.tag}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{file.specs}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{file.size}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck size={16} />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Document Lineage</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Cross-Format Text Overlap</h4>
                  <p className="text-emerald-200/80 leading-relaxed text-xs">
                    NLP embeddings identified 95% semantic text match between DOCX and PDF. `Final.docx` contains all 12 sections and the newest modification timestamp.
                  </p>
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                    <span className="text-slate-400">Reclaimable Storage:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">338 KB</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'audio' && (
              <div className="grid md:grid-cols-[1.3fr_0.7fr] gap-4 items-center">
                <div className="space-y-2.5">
                  {[
                    { name: 'Studio_Podcast_Master.wav', size: '450 MB', specs: '24-bit / 48kHz Lossless PCM', tag: '★ Studio WAV', isMaster: true },
                    { name: 'Studio_Podcast_320k.mp3', size: '32 MB', specs: '320 kbps CBR MP3 export', tag: 'MP3 Copy', isMaster: false },
                    { name: 'Studio_Podcast_VoiceNote.m4a', size: '10 MB', specs: '128 kbps AAC Mono export', tag: 'Share Copy', isMaster: false }
                  ].map(file => (
                    <div
                      key={file.name}
                      className={`flex items-center justify-between rounded-xl p-3 border transition-colors ${
                        file.isMaster
                          ? 'border-emerald-500/40 bg-emerald-950/20'
                          : 'border-white/[0.08] bg-[#14171e]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`grid h-8 w-8 place-items-center rounded-lg ${file.isMaster ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/[0.06] text-slate-400'}`}>
                          <HardDrive size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{file.name}</span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${file.isMaster ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-slate-400'}`}>
                              {file.tag}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">{file.specs}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-white">{file.size}</span>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <ShieldCheck size={16} />
                    <span className="font-bold uppercase tracking-wider text-[10px]">Acoustic Fingerprint</span>
                  </div>
                  <h4 className="font-bold text-sm text-white">Lossless PCM Retention</h4>
                  <p className="text-emerald-200/80 leading-relaxed text-xs">
                    Chromaprint analysis confirmed identical audio streams. Retaining the 24-bit WAV prevents compression artifacts.
                  </p>
                  <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between">
                    <span className="text-slate-400">Reclaimable Storage:</span>
                    <span className="font-mono font-bold text-emerald-400 text-sm">492 MB</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. Technology Pipeline Strip (Level2 Partner Style) ── */}
      <section id="pipeline" className="border-y border-white/[0.06] bg-[#0b0d11] py-12 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-brand-400">
              4-Stage Multi-Modal Detection Pipeline
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Every indexed file passes through our sequential algorithmic pipeline.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { num: '01', name: 'Exact SHA-256 Pass', desc: 'Instant byte-for-byte clone detection across entire file system', badge: 'Byte-Exact' },
              { num: '02', name: 'Perceptual Vision', desc: 'pHash, dHash, & wHash visual fingerprints for photos and burst shots', badge: 'Vision' },
              { num: '03', name: 'Document NLP', desc: 'Cross-format text extraction (DOCX ↔ PDF ↔ TXT) with cosine overlap', badge: 'Semantic' },
              { num: '04', name: 'Louvain Graph', desc: 'Topological community partition to pick and retain optimal master files', badge: 'Clustering' }
            ].map(item => (
              <div key={item.num} className="rounded-2xl border border-white/[0.08] bg-[#12141a] p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-400">{item.num}</span>
                  <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[9px] font-mono text-slate-400">{item.badge}</span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 6. Features Grid (Level2 Bento Card Style) ── */}
      <section id="features" className="py-20 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold font-display text-white">Engineered for Safe Storage Cleanup</h2>
          <p className="text-sm text-slate-400">Full visibility and control over every duplicate cluster.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-3xl border border-white/[0.08] bg-[#101217] p-8 space-y-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">30-Day Safe Quarantine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Files are never permanently destroyed on scan. Quarantined copies are isolated in a soft local bin with 1-click instant restore.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#101217] p-8 space-y-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">100% On-Device Neural Sandbox</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero cloud latency, zero bandwidth consumption. Your personal photographs and confidential documents remain private on your hardware.
            </p>
          </div>

          <div className="rounded-3xl border border-white/[0.08] bg-[#101217] p-8 space-y-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/15 text-purple-400">
              <Layers size={20} />
            </div>
            <h3 className="text-lg font-bold text-white">Topological Community Partition</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Louvain graph modularity links related files into cohesive clusters and highlights the highest quality master with clear reasoning.
            </p>
          </div>
        </div>
      </section>

      {/* ── 7. FAQ Accordion Section (Level2 Style) ── */}
      <section id="faq" className="border-t border-white/[0.06] bg-[#0b0d11] py-20 px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-white">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-slate-400">Everything you need to know about DedupeIQ's deduplication technology.</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/[0.08] bg-[#12141a] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-white hover:text-brand-300 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`transform transition-transform text-slate-400 ${openFaq === idx ? 'rotate-180 text-brand-400' : ''}`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 8. Footer ── */}
      <footer className="border-t border-white/[0.08] bg-[#08090b] py-8 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">DedupeIQ</span>
            <span>·</span>
            <span>Intelligent Storage Deduplication</span>
            <span>·</span>
            <span className="font-mono">FINDATHON 2026</span>
          </div>
          <button
            onClick={handleInstantDemo}
            className="text-brand-400 hover:underline font-semibold cursor-pointer"
          >
            Launch Guest Demo →
          </button>
        </div>
      </footer>

      {/* ── 9. Level2-Style Auth Modal ── */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl border border-white/[0.12] bg-[#12141a] p-7 shadow-2xl space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                <div>
                  <h3 className="text-lg font-bold font-display text-white">
                    {authMode === 'signin' ? 'Sign In to Workspace' : authMode === 'signup' ? 'Create Local Workspace' : 'Reset Password'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authMode === 'signin' ? 'Access your private catalog.' : authMode === 'signup' ? 'Get an isolated local index.' : 'Enter your email for instructions.'}
                  </p>
                </div>
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 text-slate-400 hover:text-white"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Instant Demo Quick Access */}
              <button
                type="button"
                onClick={handleInstantDemo}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 py-2.5 px-4 text-xs font-bold text-white transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Zap size={14} className="fill-white" />
                <span>Instant Demo (Preloaded Dataset)</span>
                <ArrowRight size={14} />
              </button>

              {/* Mode Toggle Tabs */}
              {authMode !== 'forgot' && (
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-white/10 bg-[#0c0e12] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signin')
                      setError(null)
                    }}
                    className={`rounded-lg py-1.5 font-bold transition-colors ${
                      authMode === 'signin' ? 'bg-[#202328] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('signup')
                      setError(null)
                    }}
                    className={`rounded-lg py-1.5 font-bold transition-colors ${
                      authMode === 'signup' ? 'bg-[#202328] text-white shadow-sm' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>
              )}

              {/* Alerts */}
              {error && (
                <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 p-2.5 text-xs text-rose-200 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMessage && (
                <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-2.5 text-xs text-emerald-200 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Full Name</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="text"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#0c0e12] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Email Address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      placeholder="alex.morgan@workspace.io"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-[#0c0e12] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors"
                      required
                    />
                  </div>
                </div>

                {authMode !== 'forgot' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-semibold text-slate-300">Password</label>
                      {authMode === 'signin' && (
                        <button
                          type="button"
                          onClick={() => setAuthMode('forgot')}
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
                        className="w-full rounded-xl border border-white/15 bg-[#0c0e12] pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors font-mono"
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

                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Confirm Password</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-3 text-slate-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-white/15 bg-[#0c0e12] pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-white hover:bg-slate-200 py-2.5 text-xs font-bold text-[#08090b] transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm mt-2"
                >
                  <span>
                    {loading
                      ? 'Please wait...'
                      : authMode === 'signin'
                      ? 'Sign In to Workspace'
                      : authMode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
                  </span>
                  {!loading && <ArrowRight size={14} />}
                </button>
              </form>

              {/* Quick Fill Accounts */}
              {authMode === 'signin' && (
                <div className="pt-3 border-t border-white/[0.08] space-y-2">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick-Fill Test Accounts
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {quickUsers.map(u => (
                      <button
                        key={u.email}
                        type="button"
                        onClick={() => handleQuickSelect(u)}
                        className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-2 text-left hover:border-brand-500/40 hover:bg-white/[0.06] transition-colors"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
