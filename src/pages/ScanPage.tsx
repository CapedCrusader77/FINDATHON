import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderOpen,
  Upload,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  HardDrive,
  FileText,
  Image as ImageIcon,
  Clock,
  Terminal,
  RefreshCw
} from 'lucide-react'
import { startScan, fetchScanProgress } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import { useToast } from '../components/Toast'

interface FileLog {
  id: string
  file: string
  size: string
  stage: string
  status: string
}

export default function ScanWorkflow() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pushToast } = useToast()

  const [activeMode, setActiveMode] = useState<'upload' | 'local'>('upload')
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [localPathInput, setLocalPathInput] = useState('')
  const [scanId, setScanId] = useState<string | null>(null)
  const [logs, setLogs] = useState<FileLog[]>([])

  const stages = [
    { key: 'discovering', label: 'File Discovery', icon: FolderOpen, desc: 'Crawling tree structure' },
    { key: 'hashing', label: 'SHA-256 Hashing', icon: Cpu, desc: 'Exact cryptographic pass' },
    { key: 'analyzing', label: 'Vector Extraction', icon: Sparkles, desc: 'pHash & text embeddings' },
    { key: 'clustering', label: 'Louvain Graphing', icon: Layers, desc: 'Master recommendation' }
  ]

  const mutation = useMutation({
    mutationFn: startScan,
    onSuccess: result => {
      setScanId(result.id)
      pushToast('Scan initiated. Analyzing duplicate candidates in background.', 'info')
    },
    onError: () => {
      pushToast('Could not start scan. Please verify folder permissions.', 'error')
    }
  })

  const progressQuery = useQuery({
    queryKey: ['scan-progress', scanId],
    queryFn: () => fetchScanProgress(scanId!),
    enabled: Boolean(scanId),
    refetchInterval: query => {
      if (query.state.data?.phase === 'complete') {
        queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        queryClient.invalidateQueries({ queryKey: ['groups'] })
        queryClient.invalidateQueries({ queryKey: ['history'] })
        return false
      }
      return 600
    }
  })

  // Stream incoming file progress into the terminal log
  useEffect(() => {
    if (progressQuery.data?.current_file) {
      const current = progressQuery.data.current_file
      setLogs(prev => {
        if (prev.some(l => l.file === current)) return prev
        return [
          {
            id: Math.random().toString(),
            file: current,
            size: 'Analyzed',
            stage: progressQuery.data?.phase || 'Processing',
            status: 'success'
          },
          ...prev.slice(0, 49)
        ]
      })
    }
  }, [progressQuery.data?.current_file, progressQuery.data?.phase])

  const effectivePhase = (progressQuery.data?.phase as any) || (mutation.isPending ? 'discovering' : 'idle')
  const effectiveProgress = progressQuery.data?.total
    ? Math.round((progressQuery.data.processed / progressQuery.data.total) * 100)
    : mutation.isPending
    ? 15
    : effectivePhase === 'complete'
    ? 100
    : 0

  const isScanning = mutation.isPending || (effectivePhase !== 'idle' && effectivePhase !== 'complete')

  const handleStartUploadScan = () => {
    if (!selectedFiles?.length) return
    const files = Array.from(selectedFiles)
    
    // Populate logs with real selected files
    setLogs(
      files.slice(0, 10).map((f, i) => ({
        id: String(i),
        file: f.name,
        size: formatBytes(f.size),
        stage: 'Ingesting',
        status: 'queued'
      }))
    )

    mutation.mutate({
      name: files[0].webkitRelativePath?.split('/')[0] || 'Uploaded Folder',
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
      totalSize: 0,
      root_path: localPathInput.trim()
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">
              Multi-Modal Pipeline
            </p>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white font-display">
            Scan & Identify Duplicates
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl">
            Choose a folder from your drive. DedupeIQ processes every file locally through SHA-256 cryptographic hashing, perceptual image fingerprints, and cross-format text embeddings.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-950/20 px-3.5 py-2 rounded-xl">
          <ShieldCheck size={16} /> 100% Local-First Engine
        </div>
      </div>

      {/* Main Scan Config Card */}
      <Card className="p-6 sm:p-8 border-white/10 bg-slate-900/70 shadow-2xl">
        <div className="space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center gap-3 border-b border-white/10 pb-5">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeMode === 'upload'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Upload size={16} />
              <span>Select Folder from Browser</span>
            </button>

            <button
              onClick={() => setActiveMode('local')}
              className={`flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeMode === 'local'
                  ? 'bg-indigo-600 text-white shadow-glow'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <HardDrive size={16} />
              <span>Enter Local System Path</span>
            </button>
          </div>

          {/* Mode 1: Browser Folder Selection */}
          {activeMode === 'upload' && (
            <div className="space-y-5">
              <label
                htmlFor="folder-upload"
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-slate-950/50 p-8 sm:p-12 text-center hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all cursor-pointer"
              >
                <input
                  id="folder-upload"
                  type="file"
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  multiple
                  onChange={e => setSelectedFiles(e.target.files)}
                  className="hidden"
                />

                <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-glow">
                  <FolderOpen size={30} />
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  {selectedFiles?.length
                    ? `${selectedFiles.length} files selected in "${selectedFiles[0].webkitRelativePath?.split('/')[0] || 'folder'}"`
                    : 'Click to select a folder from your computer'}
                </h3>

                <p className="mt-1 text-xs text-slate-400 max-w-md">
                  Supports all standard photos (JPEG, PNG, WebP, HEIC, RAW) and documents (DOCX, PDF, TXT, MD).
                </p>

                {selectedFiles && (
                  <div className="mt-4 flex items-center gap-3">
                    <Badge tone="purple">{selectedFiles.length} Files Ready</Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatBytes(Array.from(selectedFiles).reduce((acc, f) => acc + f.size, 0))} Total
                    </span>
                  </div>
                )}
              </label>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Sparkles size={14} className="text-indigo-400" />
                  <span>Files remain on your local disk. No external cloud upload.</span>
                </div>

                <Button
                  size="lg"
                  disabled={!selectedFiles?.length || isScanning}
                  onClick={handleStartUploadScan}
                  className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white shadow-glow px-8"
                >
                  {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                  <span>{isScanning ? 'Analyzing Files...' : 'Start Deduplication Scan'}</span>
                  <ArrowUpRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Mode 2: Local Server Path Input */}
          {activeMode === 'local' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Absolute Directory Path on Server / Machine
                </label>
                <div className="flex items-center rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm focus-within:border-indigo-500 transition-colors">
                  <FolderOpen size={18} className="text-indigo-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    value={localPathInput}
                    onChange={e => setLocalPathInput(e.target.value)}
                    placeholder="e.g. E:\Projects\FINDATHON or C:\Users\YourName\Pictures"
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>
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
                    ? 'All duplicate candidate clusters have been evaluated and stored in your database.'
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
                      Duplicate clusters and master recommendations are ready to review.
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
