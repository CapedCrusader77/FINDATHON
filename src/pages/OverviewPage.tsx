import React from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  FolderOpen,
  Copy as CopyIcon,
  HardDrive,
  BarChart3,
  FileText,
  Image as ImageIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  RefreshCw,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Cpu,
  FileCheck,
  Scissors,
  Minimize2,
  FileCode,
  Star
} from 'lucide-react'
import { fetchDashboard, fetchGroups, fetchHistory } from '../lib/api'
import { formatBytes, formatDate } from '../lib/utils'
import { DashboardData, DuplicateGroup, ScanRecord } from '../types'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import RecoverySimulator from '../components/RecoverySimulator'
import { useAuth } from '../context/AuthContext'

export default function OverviewPage() {
  const { user } = useAuth()

  const { data: dashboard, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard', user?.email],
    queryFn: () => fetchDashboard(user?.email)
  })

  const { data: groups = [] } = useQuery<DuplicateGroup[]>({
    queryKey: ['groups', user?.email],
    queryFn: () => fetchGroups(user?.email)
  })

  const { data: history = [] } = useQuery<ScanRecord[]>({
    queryKey: ['history', user?.email],
    queryFn: () => fetchHistory(user?.email)
  })

  if (isLoading || !dashboard) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2.5 text-xs text-slate-400 font-mono">
          <RefreshCw size={14} className="animate-spin text-brand-400" />
          <span>Connecting to local storage database...</span>
        </div>
      </div>
    )
  }

  // Zero-State: When no files have been scanned yet
  if (dashboard.filesScanned === 0 && groups.length === 0) {
    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#242830] pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-2 w-2 rounded-full bg-brand-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
                Storage Intelligence Workstation
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              No files scanned yet
            </h2>
            <p className="mt-1 max-w-xl text-xs text-slate-400 leading-relaxed">
              DedupeIQ compares image pixels, perceptual frequencies, and cross-format document texts to uncover duplicate groups on your device.
            </p>
          </div>

          <Link to="/scan">
            <Button size="lg" className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold shadow-glow">
              <FolderOpen size={16} />
              <span>Start First Scan</span>
            </Button>
          </Link>
        </div>

        {/* Empty State Banner */}
        <Card className="p-8 sm:p-14 text-center border-dashed border-[#272d3f] bg-[#11141d]">
          <div className="mx-auto max-w-md space-y-4">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-glow">
              <FolderOpen size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Ready to inspect your local storage</h3>
              <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                Select a folder to launch on-device multi-modal duplicate clustering. Nothing is deleted automatically, and nothing leaves your computer.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/scan">
                <Button size="lg" className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold px-8 shadow-glow">
                  <FolderOpen size={16} />
                  <span>Choose Folder & Scan</span>
                  <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Local Processing Guarantee */}
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-950/10 p-4 flex items-center gap-3 text-xs text-emerald-300">
          <ShieldCheck size={18} className="text-emerald-400 shrink-0" />
          <span>
            <strong>100% Local Processing:</strong> File hashes and vector embeddings are generated directly on your machine.
          </span>
        </div>
      </div>
    )
  }

  // Active State with real data
  const topPriorityGroup = groups[0]

  // Calculate real File Intelligence stats from real groups
  const exactCount = groups.filter(g => g.type === 'Exact').reduce((acc, g) => acc + (g.files.length - 1), 0)
  const nearImgCount = groups.filter(g => g.type === 'Near image').reduce((acc, g) => acc + (g.files.length - 1), 0)
  const docCount = groups.filter(g => g.type === 'Near document' || g.type === 'Semantic match').reduce((acc, g) => acc + (g.files.length - 1), 0)
  const uniqueMasterCount = groups.length

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#242830] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 font-mono">
              Live Storage Index
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
            Storage Intelligence & Duplicate Files
          </h2>
          <p className="mt-1 max-w-xl text-xs text-slate-400 leading-relaxed">
            Real-time duplicate detection, master copy recommendations, and recoverable storage metrics.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/scan">
            <Button size="md" className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold shadow-glow">
              <FolderOpen size={15} />
              <span>Scan Folder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ── 4-KPI Metric Grid (Real Backend Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Recoverable Storage (STRONGEST FOCUS) */}
        <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/30 via-[#151719] to-[#151719] p-5 relative overflow-hidden shadow-[0_0_24px_rgba(16,185,129,0.12)]">
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Recoverable Storage
                </p>
              </div>
              <p className="mt-2 text-3xl font-black font-mono tracking-tight text-emerald-300">
                {formatBytes(dashboard.recoverable)}
              </p>
              <p className="mt-1 text-[11px] text-emerald-400/80 font-medium">
                {formatBytes(dashboard.recovered)} already recovered
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <HardDrive size={18} />
            </div>
          </div>
        </div>

        {/* KPI 2: Files Analyzed */}
        <Card className="p-5 bg-[#151719] border-[#2a2e33]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Files Analyzed</p>
              <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
                {dashboard.filesScanned.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {formatBytes(dashboard.scannedSize)} total storage
              </p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <FileText size={16} />
            </div>
          </div>
        </Card>

        {/* KPI 3: Duplicate Files */}
        <Card className="p-5 bg-[#151719] border-[#2a2e33]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Duplicate Files</p>
              <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
                {dashboard.duplicateFiles.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {dashboard.filesScanned > 0
                  ? ((dashboard.duplicateFiles / dashboard.filesScanned) * 100).toFixed(1)
                  : '0'}
                % of scanned collection
              </p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CopyIcon size={16} />
            </div>
          </div>
        </Card>

        {/* KPI 4: Duplicate Groups */}
        <Card className="p-5 bg-[#151719] border-[#2a2e33]">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400">Duplicate Groups</p>
              <p className="mt-2 text-2xl font-bold font-mono tracking-tight text-white">
                {dashboard.duplicateGroups.toLocaleString()}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">Ready for review</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <BarChart3 size={16} />
            </div>
          </div>
        </Card>
      </div>

      {/* ── Highest Priority Cleanup Card (Real Top Group) ── */}
      {topPriorityGroup ? (
        <Card className="p-6 bg-gradient-to-r from-[#171a22] via-[#15171e] to-[#12141a] border border-[#2b3040] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-[10px] font-bold text-brand-300 uppercase tracking-wider font-mono">
                  ★ Highest Priority Cleanup
                </span>
                <span className="text-xs font-mono font-bold text-brand-400">
                  {topPriorityGroup.similarity}% similarity
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/10 border border-brand-500/25 text-brand-400">
                  {topPriorityGroup.type === 'Near image' ? <ImageIcon size={20} /> : <FileText size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">
                    {topPriorityGroup.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {topPriorityGroup.files.length} candidate files · {topPriorityGroup.explanation}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
                <span className="text-slate-400">Recommended master:</span>
                <span className="font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/30">
                  {topPriorityGroup.files.find(f => f.isRecommended)?.name || topPriorityGroup.files[0]?.name}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-400">Save {formatBytes(topPriorityGroup.recoverable)}</span>
              </div>
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-3 shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-400">Saveable Space</p>
                <p className="text-lg font-mono font-bold text-emerald-400">
                  +{formatBytes(topPriorityGroup.recoverable)}
                </p>
              </div>
              <Link to={`/groups/${topPriorityGroup.id}`}>
                <Button size="md" className="bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-bold shadow-sm">
                  <span>Review Group</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      ) : null}

      {/* ── File Intelligence Breakdown (Real Dynamic Counts) ── */}
      <div className="rounded-2xl border border-[#242830] bg-[#14161a] p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-[#242830] pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-brand-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
              File Intelligence & Transformation Signals
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Real Analyzed Data</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { count: exactCount.toString(), label: 'Exact duplicates', icon: CopyIcon, desc: 'Identical SHA-256 byte match', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
            { count: nearImgCount.toString(), label: 'Perceptual images', icon: ImageIcon, desc: 'pHash & downscaled derivatives', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
            { count: docCount.toString(), label: 'Document versions', icon: FileCheck, desc: 'Text n-gram revisions', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
            { count: uniqueMasterCount.toString(), label: 'Protected master files', icon: ShieldCheck, desc: 'Recommended to keep', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' }
          ].map(item => (
            <div
              key={item.label}
              className={`rounded-xl border p-3.5 space-y-1.5 ${item.color.split(' ')[1]} ${item.color.split(' ')[2]}`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xl font-mono font-bold ${item.color.split(' ')[0]}`}>
                  {item.count}
                </span>
                <item.icon size={15} className={item.color.split(' ')[0]} />
              </div>
              <p className="text-xs font-bold text-white leading-tight">{item.label}</p>
              <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Interactive Storage Recovery Simulator ── */}
      {dashboard.recoverable > 0 && <RecoverySimulator data={dashboard} />}

      {/* ── Recent Duplicate Groups (Real Groups) ── */}
      {groups.length > 0 && (
        <Card className="p-6 bg-[#14161a] border-[#242830]">
          <SectionTitle
            eyebrow="Priority Review"
            title="Duplicate Groups"
            action={
              <Link to="/groups" className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1">
                View All ({groups.length}) <ChevronRight size={13} />
              </Link>
            }
          />

          <div className="space-y-3 mt-4">
            {groups.slice(0, 4).map(group => {
              const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
              const isImage = group.type === 'Near image' || group.category === 'image'

              return (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="flex items-center justify-between rounded-xl border border-[#242830] bg-[#101216] p-3.5 hover:border-brand-500/40 hover:bg-[#16181f] transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#1c1f26] border border-[#2a2e38] text-slate-300 group-hover:border-brand-500/40">
                      {isImage ? <ImageIcon size={18} className="text-purple-400" /> : <FileText size={18} className="text-cyan-400" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                          {group.title}
                        </p>
                        <Badge tone={group.type === 'Exact' ? 'blue' : isImage ? 'purple' : 'green'}>
                          {group.similarity}% Match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{group.files.length} candidate files</span>
                        <span>·</span>
                        <span className="text-emerald-400 truncate font-mono">
                          ★ Master: {masterFile?.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right pl-3 shrink-0">
                    <p className="text-xs font-mono font-bold text-emerald-400">
                      {formatBytes(group.recoverable)}
                    </p>
                    <p className="text-[9px] text-slate-500">saveable</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
