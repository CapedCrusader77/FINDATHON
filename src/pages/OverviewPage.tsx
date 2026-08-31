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
  CheckCircle2
} from 'lucide-react'
import { fetchDashboard, fetchGroups, fetchHistory } from '../lib/api'
import { formatBytes, formatDate } from '../lib/utils'
import { DashboardData, DuplicateGroup, ScanRecord } from '../types'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import RecoverySimulator from '../components/RecoverySimulator'

export default function OverviewPage() {
  const { data: dashboard, isLoading, refetch } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: fetchDashboard
  })

  const { data: groups = [] } = useQuery<DuplicateGroup[]>({
    queryKey: ['groups'],
    queryFn: fetchGroups
  })

  const { data: history = [] } = useQuery<ScanRecord[]>({
    queryKey: ['history'],
    queryFn: fetchHistory
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
  if (dashboard.filesScanned === 0) {
    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2230] pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              Personal File Organizer
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Analyze directories to identify exact duplicates, resized photos, and cross-format document revisions.
            </p>
          </div>

          <Link to="/scan">
            <Button size="md" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold">
              <FolderOpen size={14} />
              <span>Scan Folder</span>
            </Button>
          </Link>
        </div>

        {/* Empty State Banner */}
        <Card className="p-8 sm:p-12 text-center border-dashed border-[#272d3f] bg-[#11141d]">
          <div className="mx-auto max-w-md">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-brand-600/10 text-brand-400 border border-brand-500/20">
              <FolderOpen size={22} />
            </div>
            <h3 className="mt-4 text-base font-bold text-white">No Files Scanned Yet</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Select a local folder on your workstation or enter a directory path to begin multi-modal duplicate detection.
            </p>
            <div className="mt-5">
              <Link to="/scan">
                <Button size="md" className="bg-brand-600 hover:bg-brand-500 text-white">
                  <FolderOpen size={14} />
                  <span>Start Deduplication Scan</span>
                </Button>
              </Link>
            </div>
          </div>
        </Card>

        {/* Architecture & Guarantee Grid */}
        <div className="grid gap-5 md:grid-cols-2">
          <PipelineCard onRefresh={refetch} />

          <Card className="p-5 bg-[#11141d] flex flex-col justify-between">
            <div>
              <SectionTitle
                eyebrow="Privacy & Integrity"
                title="100% Local-First Execution"
                subtitle="All file operations execute on your device."
              />
              <div className="space-y-2.5 text-xs text-slate-300 leading-relaxed">
                <p className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>SHA-256 cryptographic fast hashing and perceptual fingerprints stay in local memory.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>MongoDB Atlas holds only cluster metadata and similarity metrics.</span>
                </p>
                <p className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>Soft quarantine staging safeguards files for 30 days before permanent deletion.</span>
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-[#1e2230] pt-3 text-[11px] text-emerald-400 font-medium flex items-center gap-1.5">
              <ShieldCheck size={14} />
              <span>Local detection service ready for inspection.</span>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  // Active State: Showing real metrics from database
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2230] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-400">
              Database Synced
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">
            Storage Overview & Candidate Clusters
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Real-time duplicate metrics, recoverable storage analysis, and recommended master copies.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to="/scan">
            <Button size="md" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold">
              <FolderOpen size={14} />
              <span>Scan New Folder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Files Analyzed"
          value={dashboard.filesScanned.toLocaleString()}
          subtext={`${formatBytes(dashboard.scannedSize)} total storage`}
          icon={FileText}
          tone="blue"
        />
        <MetricCard
          label="Identified Duplicates"
          value={dashboard.duplicateFiles.toLocaleString()}
          subtext={`${dashboard.filesScanned > 0 ? Math.round((dashboard.duplicateFiles / dashboard.filesScanned) * 100) : 0}% of scanned collection`}
          icon={CopyIcon}
          tone="purple"
        />
        <MetricCard
          label="Duplicate Clusters"
          value={dashboard.duplicateGroups.toLocaleString()}
          subtext="Ready for review"
          icon={BarChart3}
          tone="amber"
        />
        <MetricCard
          label="Recoverable Storage"
          value={formatBytes(dashboard.recoverable)}
          subtext={`${formatBytes(dashboard.recovered)} already recovered`}
          icon={HardDrive}
          tone="green"
        />
      </div>

      {/* Interactive Storage ROI Simulator */}
      <RecoverySimulator data={dashboard} />

      {/* Storage Breakdown & Recent Clusters */}
      <div className="grid gap-5 lg:grid-cols-2">
        <StorageTaxonomy data={dashboard} />
        <RecentClusters groups={groups} />
      </div>

      {/* Pipeline Status */}
      <PipelineCard onRefresh={refetch} />
    </div>
  )
}

function MetricCard({
  label,
  value,
  subtext,
  icon: Icon,
  tone
}: {
  label: string
  value: string
  subtext: string
  icon: any
  tone: 'blue' | 'purple' | 'amber' | 'green'
}) {
  return (
    <Card className="p-5 bg-[#11141d] border-[#1e2230]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-bold font-mono tracking-tight text-white">{value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{subtext}</p>
        </div>

        <div
          className={`grid h-8 w-8 place-items-center rounded-lg border ${
            tone === 'blue'
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              : tone === 'purple'
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              : tone === 'amber'
              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}
        >
          <Icon size={16} />
        </div>
      </div>
    </Card>
  )
}

function StorageTaxonomy({ data }: { data: DashboardData }) {
  const breakdown = data.storageBreakdown || []

  return (
    <Card className="p-5 bg-[#11141d] border-[#1e2230]">
      <SectionTitle
        eyebrow="Storage Taxonomy"
        title="Workspace Category Distribution"
      />

      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-300">
          <span>Total Scanned Volume</span>
          <span className="font-mono font-bold text-white">{formatBytes(data.scannedSize)}</span>
        </div>

        {/* Progress Bar Breakdown */}
        <div className="h-3 w-full overflow-hidden rounded-md bg-[#1a1e29] flex">
          {breakdown.map((item, idx) => (
            <div
              key={item.name}
              style={{ width: `${item.value}%`, backgroundColor: item.color }}
              className="h-full transition-all duration-300"
              title={`${item.name}: ${item.value}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1e2230]">
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
    <Card className="p-5 bg-[#11141d] border-[#1e2230]">
      <SectionTitle
        eyebrow="Priority Review"
        title="Recent Duplicate Clusters"
        action={
          <Link to="/groups" className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1">
            View All ({groups.length}) <ChevronRight size={13} />
          </Link>
        }
      />

      {topGroups.length > 0 ? (
        <div className="space-y-2">
          {topGroups.map(group => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="flex items-center justify-between rounded-lg border border-[#1e2230] bg-[#161922] p-3 hover:border-[#2f374e] hover:bg-[#1a1e29] transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#222738] text-slate-300">
                  {group.type === 'Near image' ? <ImageIcon size={15} /> : <FileText size={15} />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-white">{group.title}</p>
                    <Badge tone={group.type === 'Exact' ? 'blue' : 'purple'}>
                      {group.similarity}% Match
                    </Badge>
                  </div>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {group.files.length} copies · {group.explanation}
                  </p>
                </div>
              </div>

              <div className="text-right pl-3 shrink-0">
                <p className="text-xs font-mono font-bold text-emerald-400">{formatBytes(group.recoverable)}</p>
                <p className="text-[9px] text-slate-400">recoverable</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-[#1e2230] rounded-lg">
          No duplicate clusters detected.
        </div>
      )}
    </Card>
  )
}

function PipelineCard({ onRefresh }: { onRefresh: () => void }) {
  const steps = [
    { name: 'Exact SHA-256 Hashing', desc: 'Instant byte-for-byte matching' },
    { name: 'Perceptual Visual Fingerprints', desc: 'pHash, dHash, & wHash Hamming distance' },
    { name: 'Deep NLP Text Normalization', desc: 'Cross-format DOCX ⟷ PDF ⟷ TXT parser' },
    { name: 'Explainable Louvain Clustering', desc: 'Community grouping with master star' }
  ]

  return (
    <Card className="p-5 bg-[#11141d] border-[#1e2230]">
      <SectionTitle
        eyebrow="Architecture"
        title="4-Stage Multi-Modal Pipeline"
        action={
          <button
            onClick={onRefresh}
            className="grid h-7 w-7 place-items-center rounded border border-[#222634] text-slate-400 hover:text-white"
            title="Refresh status"
          >
            <RefreshCw size={13} />
          </button>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-2">
        {steps.map((step, idx) => (
          <div key={step.name} className="flex items-center gap-3 rounded-lg border border-[#1e2230] bg-[#161922] p-2.5">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-brand-500/15 text-[11px] font-mono font-bold text-brand-300">
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
