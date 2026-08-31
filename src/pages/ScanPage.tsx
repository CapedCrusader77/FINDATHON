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
  RefreshCw
} from 'lucide-react'
import { startScan, fetchScanProgress } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { Card, SectionTitle, Button, Badge, TrafficLights } from '../components/ui'
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
    { key: 'discovering', label: 'File Discovery', icon: FolderOpen, desc: 'Crawling directory trees', color: 'from-blue-500 to-indigo-600' },
    { key: 'hashing', label: 'SHA-256 Bit Pass', icon: Cpu, desc: 'Cryptographic exact matches', color: 'from-indigo-500 to-purple-600' },
    { key: 'analyzing', label: 'Vector Extraction', icon: Sparkles, desc: 'Perceptual & NLP embeddings', color: 'from-purple-500 to-pink-600' },
    { key: 'clustering', label: 'Louvain Graph', icon: Layers, desc: 'Master recommendation', color: 'from-emerald-500 to-teal-600' }
  ]

  const mutation = useMutation({
    mutationFn: startScan,
    onSuccess: result => {
      setScanId(result.id)
      pushToast('Scan initiated. Analyzing duplicate candidates in background worker.', 'info')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Intelligent File Scanner
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Execute an on-device multi-modal scan across your directories to cluster identical and near-duplicate files.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 rounded-full backdrop-blur-md">
          <ShieldCheck size={14} />
          <span>Local Engine · Zero External Uploads</span>
        </div>
      </div>

      {/* Main Scan Config Card */}
      <Card className="p-6 sm:p-8">
        <div className="space-y-6">
          {/* Mode Switcher Segmented Control */}
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-4">
            <button
              onClick={() => setActiveMode('upload')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeMode === 'upload'
                  ? 'bg-blue-600 text-white shadow-glowBlue'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <Upload size={14} />
              <span>Select Folder from Browser</span>
            </button>

            <button
              onClick={() => setActiveMode('local')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                activeMode === 'local'
                  ? 'bg-blue-600 text-white shadow-glowBlue'
                  : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
              }`}
            >
              <HardDrive size={14} />
              <span>Enter Local System Directory Path</span>
            </button>
          </div>

          {/* Mode 1: Browser Folder Upload */}
          {activeMode === 'upload' && (
            <div className="space-y-5">
              <label
                htmlFor="folder-upload"
                className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.14] bg-white/[0.02] p-10 text-center hover:border-blue-500/60 hover:bg-white/[0.05] transition-all cursor-pointer"
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

                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-glowBlue group-hover:scale-105 transition-transform">
                  <FolderOpen size={26} />
                </div>

                <h3 className="mt-4 text-base font-bold text-white">
                  {selectedFiles?.length
                    ? `${selectedFiles.length} files staged from "${selectedFiles[0].webkitRelativePath?.split('/')[0] || 'folder'}"`
                    : 'Click to select a local folder'}
                </h3>

                <p className="mt-1 text-xs text-slate-400 max-w-md">
                  Processes photos (JPEG, PNG, WebP, RAW) and documents (DOCX, PDF, TXT, Markdown).
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

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-400">
                  Files remain on local disk. Zero telemetry or metadata uploaded.
                </p>

                <Button
                  size="md"
                  disabled={!selectedFiles?.length || isScanning}
                  onClick={handleStartUploadScan}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-7 shadow-glowBlue rounded-xl"
                >
                  {isScanning ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                  <span>{isScanning ? 'Analyzing Files...' : 'Start Deduplication Scan'}</span>
                  <ArrowRight size={14} />
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
                <div className="flex items-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-3.5 py-2.5 text-xs focus-within:border-blue-500 focus:bg-white/[0.08] backdrop-blur-md">
                  <FolderOpen size={16} className="text-blue-400 mr-3 shrink-0" />
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 shadow-glowBlue text-xs rounded-xl"
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
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400 font-mono">
                  Active Execution Pass
                </p>
              </div>
              <h3 className="mt-1 text-lg font-bold text-white">
                {effectivePhase === 'complete'
                  ? 'Scan Complete · Deduplication Graph Ready'
                  : effectivePhase === 'discovering'
                  ? 'Discovering Files & Directory Trees...'
                  : effectivePhase === 'hashing'
                  ? 'Computing Cryptographic SHA-256 Fast Hashes...'
                  : effectivePhase === 'analyzing'
                  ? 'Extracting Perceptual Hashes & Text Embeddings...'
                  : 'Constructing Louvain Duplicate Clusters...'}
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">
                {effectivePhase === 'complete'
                  ? 'All duplicate candidate clusters have been evaluated and stored in your workspace.'
                  : `Processing candidate queue: ${effectiveProgress}% completed.`}
              </p>
            </div>

            <span className="font-mono text-3xl font-extrabold text-blue-400">
              {effectiveProgress}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.08] p-0.5">
            <div
              style={{ width: `${effectiveProgress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 rounded-full shadow-glowBlue"
            />
          </div>

          {/* 4 Stage Cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 pt-1">
            {stages.map((stage, idx) => {
              const stageOrder = ['discovering', 'hashing', 'analyzing', 'clustering', 'complete']
              const currentIndex = stageOrder.indexOf(effectivePhase)
              const isPassed = currentIndex >= idx + 1
              const isCurrent = stage.key === effectivePhase
              const Icon = stage.icon

              return (
                <div
                  key={stage.key}
                  className={`rounded-2xl border p-4 transition-all ${
                    isPassed
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                      : isCurrent
                      ? 'border-blue-500/50 bg-blue-500/15 text-white shadow-glowBlue'
                      : 'border-white/[0.08] bg-white/[0.02] text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon size={16} className={isPassed ? 'text-emerald-400' : isCurrent ? 'text-blue-400 animate-pulse' : ''} />
                    {isPassed ? (
                      <CheckCircle2 size={15} className="text-emerald-400" />
                    ) : (
                      <span className="font-mono text-xs text-slate-500">{idx + 1}</span>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-bold text-white">{stage.label}</p>
                  <p className="mt-0.5 text-[10px] text-slate-400">{stage.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Complete Banner */}
          {effectivePhase === 'complete' && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-emerald-500/35 bg-emerald-500/15 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-3.5">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-slate-950 font-bold text-base shadow-glowEmerald">
                  ✓
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Completed</h4>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Duplicate clusters and master recommendations are ready for review.
                  </p>
                </div>
              </div>

              <Link to="/groups">
                <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs h-9 px-4 rounded-xl shadow-glowEmerald">
                  <span>Review Duplicate Groups</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          )}

          {/* Live Ingest Log Stream */}
          {logs.length > 0 && (
            <div className="rounded-2xl border border-white/[0.10] bg-black/40 p-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5 mb-2.5">
                <div className="flex items-center gap-2 font-bold text-slate-300">
                  <Terminal size={14} className="text-blue-400" />
                  <span>Real-Time Ingest Stream</span>
                </div>
                <Badge tone="blue">Streaming</Badge>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2 text-[11px]">
                {logs.map(log => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.04] px-3 py-1.5 border border-white/[0.06]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="truncate text-slate-300">{log.file}</span>
                      <span className="text-slate-500 text-[10px]">({log.size})</span>
                    </div>
                    <span className="text-[10px] text-blue-300 shrink-0 pl-2">
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
