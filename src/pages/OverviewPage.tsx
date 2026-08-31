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
  Cpu
} from 'lucide-react'
import { fetchDashboard, fetchGroups, fetchHistory } from '../lib/api'
import { formatBytes, formatDate } from '../lib/utils'
import { DashboardData, DuplicateGroup, ScanRecord } from '../types'
import { Card, SectionTitle, Button, Badge, TrafficLights } from '../components/ui'
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
          <RefreshCw size={15} className="animate-spin text-blue-400" />
          <span>Syncing macOS Pro Storage Index...</span>
        </div>
      </div>
    )
  }

  // Zero-State: When no files have been scanned yet
  if (dashboard.filesScanned === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400 font-mono">
                Neural File Intelligence
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              Workspace Overview & Clean Engine
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Analyze directories to identify exact clones, burst photos, and cross-format document revisions.
            </p>
          </div>

          <Link to="/scan">
            <Button size="md" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-glowBlue rounded-xl">
              <FolderOpen size={14} />
              <span>Scan Directory</span>
            </Button>
          </Link>
        </div>

        {/* Empty State Card */}
        <Card className="p-8 sm:p-14 text-center border-dashed border-white/[0.15] bg-white/[0.02]">
          <div className="mx-auto max-w-md">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-glowBlue">
              <FolderOpen size={26} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-white">No Files Indexed In This Workspace</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Select a local folder on your computer or provide a system directory path to begin multi-modal duplicate clustering.
            </p>
            <div className="mt-6 flex justify-center">
              <Link to="/scan">
                <Button size="md" className="bg-blue-600 hover:bg-blue-500 text-white shadow-glowBlue rounded-xl">
                  <Sparkles size={14} />
                  <span>Start Deduplication Scan</span>
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Pipeline Specs Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          <PipelineArchitectureCard onRefresh={refetch} />

          <Card className="p-6 flex flex-col justify-between">
            <div>
              <SectionTitle
                eyebrow="Integrity Guarantee"
                title="100% On-Device Neural Processing"
                subtitle="All file operations execute locally in sandboxed memory."
              />
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>SHA-256 cryptographic fast hashing and perceptual visual fingerprints stay on local disk.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Cross-format DOCX, PDF, and Markdown text embeddings normalized via localized NLP.</span>
                </p>
                <p className="flex items-start gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Non-destructive 30-day soft quarantine staging with instant 1-click restore.</span>
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.08] pt-3.5 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>macOS On-Device Engine Ready.</span>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Active State: Real Metrics
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400 font-mono">
              Live Workspace Active
            </span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Storage Intelligence & Duplicate Candidates
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time duplicate metrics, recoverable storage analysis, and recommended master copies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/scan">
            <Button size="md" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-glowBlue rounded-xl">
              <FolderOpen size={14} />
              <span>Scan New Folder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Files Analyzed"
          value={dashboard.filesScanned.toLocaleString()}
          subtext={`${formatBytes(dashboard.scannedSize)} total storage`}
          icon={FileText}
          color="from-blue-500 to-indigo-600"
        />
        <MetricCard
          label="Identified Duplicates"
          value={dashboard.duplicateFiles.toLocaleString()}
          subtext={`${dashboard.filesScanned > 0 ? Math.round((dashboard.duplicateFiles / dashboard.filesScanned) * 100) : 0}% of scanned collection`}
          icon={CopyIcon}
          color="from-purple-500 to-pink-600"
        />
        <MetricCard
          label="Duplicate Clusters"
          value={dashboard.duplicateGroups.toLocaleString()}
          subtext="Ready for review"
          icon={BarChart3}
          color="from-amber-500 to-orange-600"
        />
        <MetricCard
          label="Recoverable Storage"
          value={formatBytes(dashboard.recoverable)}
          subtext={`${formatBytes(dashboard.recovered)} already recovered`}
          icon={HardDrive}
          color="from-emerald-500 to-teal-600"
        />
      </div>

      {/* Interactive Storage Simulator */}
      <RecoverySimulator data={dashboard} />

      {/* Storage Breakdown & Recent Clusters */}
      <div className="grid gap-5 lg:grid-cols-2">
        <StorageTaxonomy data={dashboard} />
        <RecentClusters groups={groups} />
      </div>

      {/* Pipeline Status */}
      <PipelineArchitectureCard onRefresh={refetch} />
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  color
}: {
  label: string
  value: string
  subtext: string
  icon: any
  color: string
}) {
  return (
    <Card className="p-5 relative overflow-hidden group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold font-mono tracking-tight text-white">{value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{subtext}</p>
        </div>

        <div className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} text-white shadow-lg group-hover:scale-105 transition-transform`}>
          <Icon size={18} />
        </div>
      </div>
    </Card>
  )
}

function StorageTaxonomy({ data }: { data: DashboardData }) {
  const breakdown = data.storageBreakdown || []

  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Storage Distribution"
        title="Workspace Category Breakdown"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Total Scanned Volume</span>
          <span className="font-mono font-bold text-white">{formatBytes(data.scannedSize)}</span>
        </div>

        {/* Progress Bar */}
        <div className="h-3.5 w-full overflow-hidden rounded-full bg-white/[0.06] flex p-0.5">
          {breakdown.map(item => (
            <div
              key={item.name}
              style={{ width: `${item.value}%`, backgroundColor: item.color }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300"
              title={`${item.name}: ${item.value}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/[0.08]">
          {breakdown.map(item => (
            <div key={item.name} className="text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
              </div>
              <p className="mt-0.5 font-mono font-bold text-white text-xs">{item.value}%</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

function RecentClusters({ groups }: { groups: DuplicateGroup[] }) {
  const topGroups = groups.slice(0, 3)

  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Priority Review"
        title="Recent Duplicate Clusters"
        action={
          <Link to="/groups" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
            View All ({groups.length}) <ChevronRight size={13} />
          </Link>
        }
      />

      {topGroups.length > 0 ? (
        <div className="space-y-2.5">
          {topGroups.map(group => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] p-3.5 hover:border-white/[0.18] hover:bg-white/[0.07] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white">
                  {group.type === 'Near image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-white">{group.title}</p>
                    <Badge tone={group.type === 'Exact' ? 'blue' : 'purple'}>
                      {group.similarity}% Match
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {group.files.length} copies · {group.explanation}
                  </p>
                </div>
              </div>

              <div className="text-right pl-3 shrink-0">
                <p className="text-xs font-mono font-bold text-emerald-400">{formatBytes(group.recoverable)}</p>
                <p className="text-[9px] text-slate-400">reclaimable</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-white/[0.10] rounded-xl">
          No duplicate clusters detected in current workspace.
        </div>
      )}
    </Card>
  )
}

function PipelineArchitectureCard({ onRefresh }: { onRefresh: () => void }) {
  const steps = [
    { name: 'Exact SHA-256 Pass', desc: 'Instant byte-for-byte clone detection', color: 'from-blue-500 to-indigo-600' },
    { name: 'Perceptual Vision Fingerprints', desc: 'pHash, dHash, & wHash Hamming distance', color: 'from-purple-500 to-pink-600' },
    { name: 'Deep NLP Text Normalizer', desc: 'Cross-format DOCX ⟷ PDF ⟷ TXT parser', color: 'from-amber-500 to-orange-600' },
    { name: 'Louvain Graph Communities', desc: 'Master copy star recommendation', color: 'from-emerald-500 to-teal-600' }
  ]

  return (
    <Card className="p-6">
      <SectionTitle
        eyebrow="Architecture"
        title="4-Stage Multi-Modal Pipeline"
        action={
          <button
            onClick={onRefresh}
            className="grid h-7 w-7 place-items-center rounded-lg border border-white/[0.12] text-slate-400 hover:text-white"
            title="Refresh status"
          >
            <RefreshCw size={13} />
          </button>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        {steps.map((step, idx) => (
          <div key={step.name} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
            <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br ${step.color} text-white font-mono font-bold text-xs shadow-sm`}>
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">{step.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{step.desc}</p>
            </div>
            <span className="text-[10px] text-emerald-400 font-semibold shrink-0">✓ Active</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
