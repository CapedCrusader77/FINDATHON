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
  ArrowRight,
  ShieldCheck,
  Cpu,
  Layers,
  Sparkles,
  HardDrive,
  FileText,
  Terminal,
  RefreshCw,
  Check
} from 'lucide-react'
import { startScan, fetchScanProgress } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle, Button, Badge, Input } from '../components/ui'
import { useToast } from '../components/Toast'

interface FileLog {
  id: string
  file: string
  size: string
  stage: string
  status: string
}

export default function ScanPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { pushToast } = useToast()

  const [activeMode, setActiveMode] = useState<'upload' | 'local'>('upload')
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [localPathInput, setLocalPathInput] = useState('')
  const [scanId, setScanId] = useState<string | null>(null)
  const [logs, setLogs] = useState<FileLog[]>([])

  const stages = [
    { key: 'discovering', label: 'File Discovery', icon: FolderOpen, desc: 'Directory crawl' },
    { key: 'hashing', label: 'SHA-256 Pass', icon: Cpu, desc: 'Binary exact match' },
    { key: 'analyzing', label: 'Vector Extraction', icon: Sparkles, desc: 'pHash & NLP vectors' },
    { key: 'clustering', label: 'Louvain Graph', icon: Layers, desc: 'Community clustering' }
  ]

  const mutation = useMutation({
    mutationFn: startScan,
    onSuccess: result => {
      setScanId(result.id)
      pushToast('Scan initiated. Analyzing duplicate candidates in local worker.', 'info')
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2230] pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">
            Intelligent Duplicate Scanner
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Execute a non-destructive multi-modal pass across your drive to cluster identical and near-duplicate files.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 rounded-lg">
          <ShieldCheck size={14} />
          <span>Local Engine · Zero Cloud Exposure</span>
        </div>
      </div>

      {/* Main Scan Config Card */}
      <Card className="p-6 bg-[#11141d] border-[#1e2230]">
        <div className="space-y-5">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 border-b border-[#1e2230] pb-4">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeMode === 'upload'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-[#161922] hover:text-white'
              }`}
            >
              <Upload size={14} />
              <span>Select Folder from Browser</span>
            </button>

            <button
              onClick={() => setActiveMode('local')}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
                activeMode === 'local'
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-[#161922] hover:text-white'
              }`}
            >
              <HardDrive size={14} />
              <span>Enter Local System Directory Path</span>
            </button>
          </div>

          {/* Mode 1: Browser Folder Selection */}
          {activeMode === 'upload' && (
            <div className="space-y-4">
              <label
                htmlFor="folder-upload"
                className="group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#272d3f] bg-[#0c0e14] p-8 text-center hover:border-brand-500/50 hover:bg-[#161922] transition-colors cursor-pointer"
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

                <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 group-hover:scale-105 transition-transform">
                  <FolderOpen size={24} />
                </div>

                <h3 className="mt-3 text-sm font-bold text-white">
                  {selectedFiles?.length
                    ? `${selectedFiles.length} files selected in "${selectedFiles[0].webkitRelativePath?.split('/')[0] || 'folder'}"`
                    : 'Click to select a local directory'}
                </h3>

                <p className="mt-1 text-xs text-slate-400 max-w-md">
                  Analyzes photos (JPEG, PNG, WebP, RAW) and documents (DOCX, PDF, TXT, MD).
                </p>

                {selectedFiles && (
                  <div className="mt-3 flex items-center gap-2.5">
                    <Badge tone="purple">{selectedFiles.length} Files Staged</Badge>
                    <span className="text-xs text-slate-400 font-mono">
                      {formatBytes(Array.from(selectedFiles).reduce((acc, f) => acc + f.size, 0))} Total Size
                    </span>
                  </div>
                )}
              </label>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Files remain on your local disk. No external uploads.
                </p>

                <Button
                  size="lg"
                  disabled={!selectedFiles?.length || isScanning}
                  onClick={handleStartUploadScan}
                  className="w-full sm:w-auto bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold px-8 py-3.5 text-sm shadow-glow cursor-pointer active:scale-95"
                >
                  {isScanning ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} className="fill-white" />}
                  <span>{isScanning ? 'Scanning in Progress...' : 'Start Deduplication Scan'}</span>
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}

          {/* Mode 2: Local Server Path Input */}
          {activeMode === 'local' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">
                  Absolute Directory Path on Local Computer
                </label>
                <div className="flex items-center rounded-lg border border-[#272d3f] bg-[#0c0e14] px-3 py-2 text-xs focus-within:border-brand-500">
                  <FolderOpen size={16} className="text-brand-400 mr-2.5 shrink-0" />
                  <input
                    type="text"
                    value={localPathInput}
                    onChange={e => setLocalPathInput(e.target.value)}
                    placeholder="e.g. E:\Projects\FINDATHON or C:\Users\Username\Pictures"
                    className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  size="md"
                  disabled={!localPathInput.trim() || isScanning}
                  onClick={handleStartPathScan}
                  className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-6 shadow-sm text-xs"
                >
                  {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  <span>Scan Directory Path</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Real-time Progress & Pipeline Execution */}
      {(isScanning || effectivePhase === 'complete') && (
        <Card className="p-6 bg-[#11141d] border-[#1e2230] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-400">
                  Active Execution Pass
                </p>
              </div>
              <h3 className="mt-1 text-base font-bold text-white">
                {effectivePhase === 'complete'
                  ? 'Scan Completed · Deduplication Graph Ready'
                  : effectivePhase === 'discovering'
                  ? 'Discovering Files & Directory Trees...'
                  : effectivePhase === 'hashing'
                  ? 'Computing Cryptographic SHA-256 Fast Hashes...'
                  : effectivePhase === 'analyzing'
                  ? 'Extracting Perceptual Hashes & Document Vectors...'
                  : 'Constructing Louvain Duplicate Clusters...'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {effectivePhase === 'complete'
                  ? 'All duplicate candidate clusters have been evaluated and stored in your database.'
                  : `Processing candidate queue: ${effectiveProgress}% completed.`}
              </p>
            </div>

            <span className="font-mono text-2xl font-bold text-brand-400">
              {effectiveProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#1a1e29]">
            <div
              style={{ width: `${effectiveProgress}%` }}
              className="h-full bg-brand-500 transition-all duration-300 rounded-full"
            />
          </div>

          {/* 4 Stage Indicators */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 pt-1">
            {stages.map((stage, idx) => {
              const stageOrder = ['discovering', 'hashing', 'analyzing', 'clustering', 'complete']
              const currentIndex = stageOrder.indexOf(effectivePhase)
              const isPassed = currentIndex >= idx + 1
              const isCurrent = stage.key === effectivePhase
              const Icon = stage.icon

              return (
                <div
                  key={stage.key}
                  className={`rounded-lg border p-3 transition-colors ${
                    isPassed
                      ? 'border-emerald-500/30 bg-emerald-950/15 text-emerald-300'
                      : isCurrent
                      ? 'border-brand-500/50 bg-brand-950/25 text-white'
                      : 'border-[#1e2230] bg-[#0c0e14] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={14} className={isPassed ? 'text-emerald-400' : isCurrent ? 'text-brand-400 animate-spin' : ''} />
                    {isPassed ? (
                      <CheckCircle2 size={13} className="text-emerald-400" />
                    ) : (
                      <span className="font-mono text-[10px] text-slate-500">{idx + 1}</span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-white">{stage.label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{stage.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Complete CTA */}
          {effectivePhase === 'complete' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500 text-slate-950">
                  <Check size={18} strokeWidth={3} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Analysis Complete</h4>
                  <p className="text-xs text-emerald-200/80 mt-0.5">
                    Duplicate groups and master recommendations ready to review.
                  </p>
                </div>
              </div>

              <Link to="/groups">
                <Button size="lg" className="bg-emerald-400 hover:bg-emerald-300 text-[#091a12] font-black text-sm px-6 py-3 shadow-[0_0_20px_rgba(52,211,153,0.3)] cursor-pointer">
                  <span>Review Duplicate Groups</span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </Button>
              </Link>
            </div>
          )}

          {/* Live Ingest Log Stream */}
          {logs.length > 0 && (
            <div className="rounded-lg border border-[#1e2230] bg-[#0c0e14] p-3.5 font-mono">
              <div className="flex items-center justify-between border-b border-[#1e2230] pb-2 mb-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Terminal size={13} className="text-brand-400" />
                  <span>Real-Time Ingest Stream</span>
                </div>
                <Badge tone="blue">Live Feed</Badge>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 text-[11px]">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded bg-[#11141d] px-2.5 py-1 border border-[#1e2230]"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate text-slate-300">{log.file}</span>
                      <span className="text-slate-500 text-[10px]">({log.size})</span>
                    </div>
                    <span className="text-[10px] text-brand-300 shrink-0 pl-2">
                      {log.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
