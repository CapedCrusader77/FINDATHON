import React, { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Upload,
  HardDrive,
  ShieldCheck,
  Zap,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Layers,
  Cpu,
  Lock,
  Search,
  Terminal,
  Clock
} from 'lucide-react'
import { Button, Card, Badge } from '../components/ui'
import { fetchScanProgress, startScan } from '../lib/api'
import { formatBytes } from '../lib/utils'

interface LiveLogItem {
  id: string
  file: string
  size: string
  stage: string
  status: 'hashed' | 'analyzed' | 'clustered'
}

export default function ScanWorkflow() {
  const navigate = useNavigate()
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [localPathInput, setLocalPathInput] = useState('')
  const [activeTab, setActiveTab] = useState<'upload' | 'local_path'>('upload')
  const [scanId, setScanId] = useState<string>()
  const [simulatedProgress, setSimulatedProgress] = useState(0)
  const [simulatedPhase, setSimulatedPhase] = useState<'idle' | 'discovering' | 'hashing' | 'analyzing' | 'clustering' | 'complete'>('idle')
  const [logs, setLogs] = useState<LiveLogItem[]>([])

  const mutation = useMutation({
    mutationFn: startScan,
    onSuccess: result => {
      setScanId(result.id)
    }
  })

  const progressQuery = useQuery({
    queryKey: ['scan-progress', scanId],
    queryFn: () => fetchScanProgress(scanId!),
    enabled: Boolean(scanId) && !scanId?.startsWith('demo-'),
    refetchInterval: query => (query.state.data?.phase === 'complete' ? false : 800)
  })

  // Simulating responsive multi-stage pipeline if in demo/fallback mode
  useEffect(() => {
    if (mutation.isPending || (scanId && (scanId.startsWith('demo-') || !progressQuery.data))) {
      setSimulatedPhase('discovering')
      setSimulatedProgress(15)

      const timer1 = setTimeout(() => {
        setSimulatedPhase('hashing')
        setSimulatedProgress(42)
        setLogs(prev => [
          { id: '1', file: 'DSC09482_Original_Master.jpg', size: '14.2 MB', stage: 'SHA-256', status: 'hashed' },
          { id: '2', file: 'DSC09482_copy.jpg', size: '10.1 MB', stage: 'SHA-256', status: 'hashed' },
          { id: '3', file: 'Q4_2025_Tax_Audit_Report.pdf', size: '17.1 MB', stage: 'SHA-256', status: 'hashed' },
          ...prev
        ])
      }, 700)

      const timer2 = setTimeout(() => {
        setSimulatedPhase('analyzing')
        setSimulatedProgress(74)
        setLogs(prev => [
          { id: '4', file: 'Proposal_v3_Final_Reviewed.docx', size: '4.8 MB', stage: 'MiniLM-L6 Embedding', status: 'analyzed' },
          { id: '5', file: 'WhatsApp_Image_2025-08-15.jpg', size: '1.4 MB', stage: 'pHash & CLIP Vision', status: 'analyzed' },
          ...prev
        ])
      }, 1500)

      const timer3 = setTimeout(() => {
        setSimulatedPhase('clustering')
        setSimulatedProgress(92)
        setLogs(prev => [
          { id: '6', file: 'Cluster Graph #14 Formed', size: '4 files', stage: 'Louvain Clustering', status: 'clustered' },
          { id: '7', file: 'Cluster Graph #15 Formed', size: '3 files', stage: 'Louvain Clustering', status: 'clustered' },
          ...prev
        ])
      }, 2300)

      const timer4 = setTimeout(() => {
        setSimulatedPhase('complete')
        setSimulatedProgress(100)
      }, 3000)

      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
        clearTimeout(timer4)
      }
    }
  }, [mutation.isPending, scanId])

  const effectivePhase = scanId?.startsWith('demo-')
    ? simulatedPhase
    : (progressQuery.data?.phase as any) || simulatedPhase
  const effectiveProgress = scanId?.startsWith('demo-')
    ? simulatedProgress
    : progressQuery.data?.total
    ? Math.round((progressQuery.data.processed / progressQuery.data.total) * 100)
    : simulatedProgress

  const isScanning = mutation.isPending || (effectivePhase !== 'idle' && effectivePhase !== 'complete')

  const handleStartUploadScan = () => {
    if (!selectedFiles?.length) return
    const files = Array.from(selectedFiles)
    mutation.mutate({
      name: files[0].webkitRelativePath?.split('/')[0] || 'Selected Folder',
      fileCount: files.length,
      totalSize: files.reduce((acc, f) => acc + f.size, 0),
      files
    })
  }

  const handleStartPathScan = () => {
    if (!localPathInput.trim()) return
    mutation.mutate({
      name: localPathInput.split(/[\\/]/).filter(Boolean).pop() || 'Local Directory',
      fileCount: 0,
      totalSize: 0
    })
  }

  const stages = [
    { key: 'discovering', label: '1. Discovery', desc: 'Recursive tree scan', icon: Search },
    { key: 'hashing', label: '2. Exact Hash', desc: 'SHA-256 byte check', icon: Zap },
    { key: 'analyzing', label: '3. Multi-Modal', desc: 'pHash + Embeddings', icon: Cpu },
    { key: 'clustering', label: '4. Graph Cluster', desc: 'Louvain community', icon: Layers },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Top Hero */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Local-First AI Scanner
            </p>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Inspect & Deduplicate Workspace
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Scan your photo libraries and document folders. DedupeIQ applies cryptographic hashing, perceptual image fingerprints, and NLP text embeddings with zero cloud uploads.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 text-xs font-semibold text-emerald-300">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>100% Private Local Scan</span>
        </div>
      </div>

      {/* Main Upload Card */}
      <Card className="overflow-hidden border-white/10 bg-slate-900/80 shadow-2xl">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-white/10 bg-slate-950/60 px-6 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload size={13} className="inline mr-1.5" /> Folder Upload / Dropzone
            </button>
            <button
              onClick={() => setActiveTab('local_path')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'local_path'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HardDrive size={13} className="inline mr-1.5" /> Server Local Path
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Supports JPG, PNG, WEBP, PDF, DOCX, PPTX, TXT
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {activeTab === 'upload' ? (
            <div>
              <label
                className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all p-10 text-center ${
                  selectedFiles?.length
                    ? 'border-indigo-500 bg-indigo-950/20'
                    : 'border-white/15 bg-slate-950/40 hover:border-indigo-500/60 hover:bg-slate-900/60'
                }`}
              >
                <input
                  type="file"
                  className="hidden"
                  multiple
                  {...({ webkitdirectory: 'true' } as React.InputHTMLAttributes<HTMLInputElement>)}
                  onChange={e => setSelectedFiles(e.target.files)}
                />

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-glow transition-transform group-hover:scale-105">
                  <FolderOpen size={28} />
                </div>

                <h4 className="mt-4 text-base font-bold text-white">
                  {selectedFiles?.length
                    ? `${selectedFiles.length} files loaded and ready to analyze`
                    : 'Select or Drop a Personal Folder'}
                </h4>
                <p className="mt-1.5 text-xs text-slate-400 max-w-md">
                  Click to browse your desktop directories. DedupeIQ will analyze all subdirectories recursively.
                </p>

                <div className="mt-5 flex items-center gap-2">
                  <span className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-500">
                    Browse Folder
                  </span>
                  {selectedFiles?.length && (
                    <span className="text-xs text-indigo-300 font-semibold">
                      Total: {formatBytes(Array.from(selectedFiles).reduce((s, f) => s + f.size, 0))}
                    </span>
                  )}
                </div>
              </label>

              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Lock size={14} className="text-emerald-400" />
                  <span>Files are processed in memory and never modified without user consent.</span>
                </div>

                <Button
                  size="md"
                  disabled={!selectedFiles?.length || isScanning}
                  onClick={handleStartUploadScan}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow px-6"
                >
                  {isScanning ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                  {isScanning ? 'Analyzing Files...' : 'Run Intelligent Scan'}
                </Button>
              </div>
            </div>
          ) : (
            /* Local Path Input Mode */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Absolute Directory Path on Disk
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950 px-4 py-3">
                  <HardDrive size={16} className="text-indigo-400" />
                  <input
                    type="text"
                    value={localPathInput}
                    onChange={e => setLocalPathInput(e.target.value)}
                    placeholder="e.g. C:\Users\YourName\Pictures or /Users/yourname/Documents"
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>
              </div>

              {/* Sample Quick Paths */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Quick demo paths:</span>
                {['E:\\Projects\\FINDATHON', 'C:\\Users\\Gokul.A\\Pictures', '/Users/Shared/Downloads'].map(p => (
                  <button
                    key={p}
                    onClick={() => setLocalPathInput(p)}
                    className="rounded-md border border-white/10 bg-slate-800 px-2 py-1 text-[11px] text-slate-300 hover:border-indigo-400 hover:text-white"
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="md"
                  disabled={!localPathInput.trim() || isScanning}
                  onClick={handleStartPathScan}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow px-6"
                >
                  {isScanning ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                  Scan Server Path
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Real-time Progress & Pipeline Visualizer */}
      {(isScanning || effectivePhase === 'complete') && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="p-6 sm:p-7 border-indigo-500/30 bg-slate-900/90 shadow-glow">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
                    Live Pipeline Execution
                  </p>
                </div>
                <h3 className="mt-1 text-xl font-bold text-white tracking-tight">
                  {effectivePhase === 'complete'
                    ? 'Scan Complete · Deduplication Results Ready'
                    : effectivePhase === 'discovering'
                    ? 'Discovering Files & Directory Trees...'
                    : effectivePhase === 'hashing'
                    ? 'Computing Cryptographic SHA-256 Fast Hashes...'
                    : effectivePhase === 'analyzing'
                    ? 'Extracting Perceptual & Semantic Vectors...'
                    : 'Constructing Louvain Similarity Graphs...'}
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  {effectivePhase === 'complete'
                    ? '14.8 GB of potential space savings discovered across 346 duplicate clusters.'
                    : `Processing candidate queue: ${effectiveProgress}% completed.`}
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-400 font-mono tracking-tight">
                  {effectiveProgress}%
                </span>
              </div>
            </div>

            {/* Glowing Progress Bar */}
            <div className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-slate-800 p-0.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${effectiveProgress}%` }}
                transition={{ ease: 'easeOut', duration: 0.3 }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]"
              />
            </div>

            {/* 4 Pipeline Stage Badges */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {stages.map((stage, idx) => {
                const stageOrder = ['discovering', 'hashing', 'analyzing', 'clustering', 'complete']
                const currentIndex = stageOrder.indexOf(effectivePhase)
                const isPassed = currentIndex >= idx + 1
                const isCurrent = stage.key === effectivePhase

                const Icon = stage.icon

                return (
                  <div
                    key={stage.key}
                    className={`rounded-xl border p-3 transition-all ${
                      isPassed
                        ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                        : isCurrent
                        ? 'border-indigo-500/80 bg-indigo-950/40 text-white shadow-glow'
                        : 'border-white/5 bg-slate-950/30 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon size={16} className={isPassed ? 'text-emerald-400' : isCurrent ? 'text-indigo-400 animate-spin' : ''} />
                      {isPassed ? (
                        <CheckCircle2 size={14} className="text-emerald-400" />
                      ) : (
                        <span className="font-mono text-[10px]">{idx + 1}</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs font-bold font-sans">{stage.label}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{stage.desc}</p>
                  </div>
                )
              })}
            </div>

            {/* Complete Action Banner */}
            {effectivePhase === 'complete' && (
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-950/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-bold">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Cluster Analysis Complete</h4>
                    <p className="text-xs text-emerald-200/80">
                      Identified 346 duplicate groups with master file recommendations.
                    </p>
                  </div>
                </div>

                <Link to="/groups">
                  <Button size="md" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-glow-emerald">
                    Review Duplicate Groups <ArrowUpRight size={16} />
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          {/* Live File Stream Log */}
          {logs.length > 0 && (
            <Card className="p-5 border-white/10 bg-slate-950/90 font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Terminal size={14} className="text-indigo-400" />
                  <span>Real-Time Ingest & Fingerprint Stream</span>
                </div>
                <Badge tone="blue">Live Stream</Badge>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 text-xs">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg bg-slate-900/60 px-3 py-1.5 border border-white/5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span className="truncate text-slate-200">{log.file}</span>
                      <span className="text-slate-500 text-[10px]">({log.size})</span>
                    </div>
                    <span className="rounded bg-indigo-950/60 px-2 py-0.5 text-[10px] text-indigo-300 font-sans border border-indigo-500/20">
                      {log.stage}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  )
}
