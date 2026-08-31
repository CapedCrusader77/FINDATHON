import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  Sliders,
  GitCompare,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Check,
  Star,
  ArrowRight,
  ChevronRight,
  GitBranch,
  Info,
  Maximize2,
  Minimize2,
  Scissors,
  Network
} from 'lucide-react'
import { fetchGroups, quarantineFile } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { DuplicateGroup, FileRecord } from '../types'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import ImageCompareModal from '../components/ImageCompareModal'
import DocumentDiffViewer from '../components/DocumentDiffViewer'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function ReviewGroupPage() {
  const { groupId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const { user } = useAuth()

  const { data: groups = [] } = useQuery<DuplicateGroup[]>({
    queryKey: ['groups', user?.email],
    queryFn: () => fetchGroups(user?.email)
  })

  const group = groups.find(g => g.id === groupId) || groups[0]

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [inspectImageOpen, setInspectImageOpen] = useState(false)
  const [docDiffOpen, setDocDiffOpen] = useState(false)
  const [activeCopyId, setActiveCopyId] = useState<string | null>(null)

  // Preselect non-master copies by default
  useEffect(() => {
    if (group) {
      const nonMasters = group.files.filter(f => !f.isRecommended).map(f => f.id)
      setSelectedIds(nonMasters)
      if (nonMasters.length > 0) {
        setActiveCopyId(nonMasters[0])
      }
    }
  }, [group])

  const quarantineMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      for (const id of ids) {
        await quarantineFile(id)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['quarantine'] })
      pushToast(`Staged ${selectedIds.length} duplicate copies into safe quarantine.`, 'info')
      navigate('/quarantine')
    }
  })

  if (!group) {
    return (
      <div className="space-y-4">
        <Link to="/groups" className="text-xs font-semibold text-brand-400 hover:underline flex items-center gap-1">
          <ArrowLeft size={13} /> Back to Duplicate Groups
        </Link>
        <Card className="p-8 text-center bg-[#11141d] border-[#1e2230]">
          <p className="text-sm font-bold text-white">Duplicate Group Not Found</p>
          <p className="mt-1 text-xs text-slate-400">This group has already been resolved or does not exist.</p>
        </Card>
      </div>
    )
  }

  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
  const nonMasterFiles = group.files.filter(f => f.id !== masterFile.id)
  const activeCopy = nonMasterFiles.find(f => f.id === activeCopyId) || nonMasterFiles[0] || masterFile

  const isImage = group.type === 'Near image' || group.category === 'image'
  const isDoc = group.type === 'Near document' || group.type === 'Semantic match' || group.category === 'document'

  const selectedBytes = group.files
    .filter(f => selectedIds.includes(f.id))
    .reduce((sum, f) => sum + f.size, 0)

  const toggleSelect = (id: string) => {
    setSelectedIds(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id]
    )
  }

  const handleQuarantineSingle = (id: string) => {
    quarantineMutation.mutate([id])
  }

  const handleKeepMasterOnly = () => {
    const idsToQuarantine = group.files.filter(f => !f.isRecommended).map(f => f.id)
    quarantineMutation.mutate(idsToQuarantine)
  }

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#242830] pb-5">
        <div>
          <Link
            to="/groups"
            className="mb-2 text-xs font-semibold text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Duplicate Groups
          </Link>
          <div className="flex flex-wrap items-center gap-2.5 mt-1">
            <h2 className="text-2xl font-bold tracking-tight text-white font-display">
              {group.title}
            </h2>
            <Badge tone={group.type === 'Exact' ? 'blue' : isImage ? 'purple' : 'green'}>
              {group.type}
            </Badge>
            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              {group.similarity}% Match
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {group.files.length} candidate files · <strong className="text-emerald-400">{formatBytes(group.recoverable)}</strong> recoverable storage
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {isImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInspectImageOpen(true)}
              className="text-xs"
            >
              <Sliders size={13} />
              <span>Split Inspector</span>
            </Button>
          )}

          {isDoc && group.diffData && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDocDiffOpen(true)}
              className="text-xs"
            >
              <GitCompare size={13} />
              <span>Document Diff</span>
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleKeepMasterOnly}
            disabled={quarantineMutation.isPending}
            className="bg-emerald-500 hover:bg-emerald-400 text-[#0f2419] font-bold text-xs shadow-sm"
          >
            <Check size={14} strokeWidth={2.5} />
            <span>Keep Master Only</span>
          </Button>

          <Button
            variant="danger"
            size="sm"
            disabled={!selectedIds.length || quarantineMutation.isPending}
            onClick={() => quarantineMutation.mutate(selectedIds)}
            className="text-xs font-semibold"
          >
            <Archive size={13} />
            <span>Quarantine Selected ({selectedIds.length})</span>
          </Button>
        </div>
      </div>

      {/* ── THE STAR DUAL COMPARISON: ORIGINAL VS COPY ── */}
      <div className="rounded-3xl border border-[#2a2e38] bg-[#12141a] p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242830] pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400 font-mono">
              Side-by-Side Visual & Spec Comparison
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Original Master vs. Candidate Copy
            </h3>
          </div>

          {/* Selector to switch which copy is compared against master */}
          {nonMasterFiles.length > 1 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">Comparing copy:</span>
              <select
                value={activeCopy.id}
                onChange={e => setActiveCopyId(e.target.value)}
                className="rounded-lg border border-[#2a2e38] bg-[#1a1c24] px-3 py-1 text-xs font-bold text-white outline-none focus:border-brand-500"
              >
                {nonMasterFiles.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({formatBytes(f.size)})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Dual Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* 1. ORIGINAL MASTER CARD */}
          <div className="rounded-2xl border-2 border-emerald-500/40 bg-[#0e1713] p-5 flex flex-col justify-between space-y-4 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                  ORIGINAL
                </span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Star size={13} className="fill-emerald-400 text-emerald-400" />
                  Recommended Master
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-white">{formatBytes(masterFile.size)}</span>
            </div>

            {/* Visual Box */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#061f14]/80 p-8 text-center flex flex-col items-center justify-center min-h-[160px] space-y-2">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-300">
                {isImage ? <ImageIcon size={28} /> : <FileText size={28} />}
              </div>
              <p className="text-sm font-bold text-white truncate max-w-[280px]">
                {masterFile.name}
              </p>
              <p className="text-xs font-mono text-emerald-300">
                {masterFile.dimensions || (masterFile.pages ? `${masterFile.pages} pages` : '100% Quality Source')}
              </p>
            </div>

            {/* Spec breakdown */}
            <div className="rounded-xl border border-emerald-500/20 bg-[#061f14]/40 p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>File Resolution</span>
                <span className="font-mono font-bold text-white">{masterFile.dimensions || 'Vector Lossless'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>File Size</span>
                <span className="font-mono font-bold text-emerald-300">{formatBytes(masterFile.size)} (Highest)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Retention Reason</span>
                <span className="text-emerald-300 text-right truncate max-w-[200px]">{group.recommendationReason}</span>
              </div>
            </div>

            <div className="pt-2">
              <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                <ShieldCheck size={15} />
                <span>Retained on System (Zero Risk)</span>
              </div>
            </div>
          </div>

          {/* 2. COPY CARD */}
          <div className="rounded-2xl border border-[#2a2e38] bg-[#14171f] p-5 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] font-bold text-slate-300">
                  COPY
                </span>
                <span className="text-xs text-slate-400">
                  {activeCopy.isRecommended ? 'Alternate copy' : 'Candidate for cleanup'}
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-slate-300">{formatBytes(activeCopy.size)}</span>
            </div>

            {/* Visual Box */}
            <div className="rounded-xl border border-[#2a2e38] bg-[#0c0e14] p-8 text-center flex flex-col items-center justify-center min-h-[160px] space-y-2">
              <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.06] text-slate-400">
                {isImage ? <ImageIcon size={28} /> : <FileText size={28} />}
              </div>
              <p className="text-sm font-bold text-white truncate max-w-[280px]">
                {activeCopy.name}
              </p>
              <p className="text-xs font-mono text-slate-400">
                {activeCopy.dimensions || (activeCopy.pages ? `${activeCopy.pages} pages` : 'Compressed Derivative')}
              </p>
            </div>

            {/* Spec breakdown */}
            <div className="rounded-xl border border-[#242830] bg-[#0c0e14] p-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>File Resolution</span>
                <span className="font-mono font-bold text-slate-300">{activeCopy.dimensions || 'Downscaled'}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>File Size</span>
                <span className="font-mono font-bold text-slate-300">{formatBytes(activeCopy.size)} (Redundant)</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Saveable Space</span>
                <span className="font-mono font-bold text-emerald-400">+{formatBytes(activeCopy.size)}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => handleQuarantineSingle(activeCopy.id)}
                disabled={quarantineMutation.isPending}
                className="w-full py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 text-xs font-bold text-center transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Archive size={14} />
                <span>Quarantine This Copy ({formatBytes(activeCopy.size)})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── WHY THEY MATCH & SIGNAL ANALYSIS ── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Why they match scores */}
        <Card className="p-6 bg-[#12141a] border-[#242830] space-y-4">
          <div className="flex items-center justify-between border-b border-[#242830] pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Detection Signals
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">{group.similarity}% Similarity Confidence</span>
          </div>

          <div className="space-y-3">
            {/* Visual similarity bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Cluster Matching Score</span>
                <span className="font-mono font-bold text-emerald-400">{group.similarity}%</span>
              </div>
              <div className="h-2 w-full bg-[#1e2229] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${group.similarity}%` }} />
              </div>
            </div>

            {/* Quality retention score */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300">Master Quality Score</span>
                <span className="font-mono font-bold text-brand-400">{masterFile.quality || 100}%</span>
              </div>
              <div className="h-2 w-full bg-[#1e2229] rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-brand-500 to-brand-400 rounded-full" style={{ width: `${masterFile.quality || 100}%` }} />
              </div>
            </div>

            {/* Dynamic signals / traits */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-[#242830]">
              {group.signals && group.signals.length > 0 ? (
                group.signals.map((sig, i) => (
                  <div key={i} className="rounded-lg border border-[#242830] bg-[#16181f] p-2.5 text-center">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <p className="text-[10px] text-slate-300 mt-0.5 truncate">{sig.label}</p>
                    {sig.value && <p className="text-[9px] text-slate-500 font-mono truncate">{sig.value}</p>}
                  </div>
                ))
              ) : (
                <>
                  <div className="rounded-lg border border-[#242830] bg-[#16181f] p-2.5 text-center">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <p className="text-[10px] text-slate-300 mt-0.5">Content Similarity</p>
                  </div>
                  <div className="rounded-lg border border-[#242830] bg-[#16181f] p-2.5 text-center">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <p className="text-[10px] text-slate-300 mt-0.5">Structure Match</p>
                  </div>
                  <div className="rounded-lg border border-[#242830] bg-[#16181f] p-2.5 text-center">
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                    <p className="text-[10px] text-slate-300 mt-0.5">Candidate Copies</p>
                  </div>
                </>
              )}
            </div>

            {/* Real explanation */}
            <div className="rounded-xl border border-brand-500/20 bg-brand-500/8 p-3 text-xs flex items-start gap-2">
              <Info size={14} className="text-brand-400 shrink-0 mt-0.5" />
              <div className="text-[11px] text-slate-300 leading-relaxed">
                <strong className="text-brand-300">Explanation: </strong>
                {group.explanation}
              </div>
            </div>
          </div>
        </Card>

        {/* ── DUPLICATE FAMILY LINEAGE WIDGET (DYNAMIC FILES) ── */}
        <Card className="p-6 bg-[#12141a] border-[#242830] space-y-4">
          <div className="flex items-center justify-between border-b border-[#242830] pb-3">
            <div className="flex items-center gap-2">
              <GitBranch size={16} className="text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Duplicate Family Tree
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">{group.files.length} Grouped Files</span>
          </div>

          {/* Tree Diagram */}
          <div className="flex flex-col items-center justify-center p-3 space-y-2">
            {/* Top Root Node (Master) */}
            <div className="rounded-xl border-2 border-emerald-500/40 bg-emerald-950/30 px-4 py-2 text-center shadow-sm">
              <p className="text-xs font-bold text-white font-mono truncate max-w-[220px]">
                {masterFile.name}
              </p>
              <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                ★ RECOMMENDED MASTER
              </span>
            </div>

            {/* Vertical connector line */}
            <div className="h-4 w-0.5 bg-slate-600" />

            {/* Horizontal Branch Bar */}
            {nonMasterFiles.length > 0 && (
              <>
                <div className="w-4/5 h-0.5 bg-slate-600 relative">
                  <div className="absolute left-0 top-0 h-2 w-0.5 bg-slate-600" />
                  <div className="absolute left-1/2 -translate-x-1/2 top-0 h-2 w-0.5 bg-slate-600" />
                  <div className="absolute right-0 top-0 h-2 w-0.5 bg-slate-600" />
                </div>

                {/* Child Derivative Nodes from real non-master files */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 w-full pt-1">
                  {nonMasterFiles.slice(0, 3).map((f, idx) => (
                    <div key={f.id} className="rounded-lg border border-[#242830] bg-[#16181f] p-2 text-center">
                      <p className="text-[10px] font-bold text-slate-300 truncate">{f.name}</p>
                      <span className="text-[9px] font-mono text-slate-400">{formatBytes(f.size)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* ── Candidate Files Table ── */}
      <Card className="p-6 bg-[#12141a] border-[#242830] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242830] pb-3">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              All Files in this Duplicate Group ({group.files.length})
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Select files to stage into 30-day quarantine. Retained master is protected.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setSelectedIds(group.files.filter(f => !f.isRecommended).map(f => f.id))}
              className="text-brand-400 hover:underline font-medium text-xs"
            >
              Select All Copies
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white font-medium text-xs"
            >
              Deselect All
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {group.files.map(file => {
            const isSelected = selectedIds.includes(file.id)
            return (
              <div
                key={file.id}
                className={`flex items-center gap-3.5 rounded-xl p-3 border transition-colors ${
                  file.isRecommended
                    ? 'bg-emerald-950/20 border-emerald-500/35'
                    : isSelected
                    ? 'bg-[#181c26] border-[#30384c]'
                    : 'bg-[#0f1116] border-[#242830]'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(file.id)}
                  disabled={file.isRecommended}
                  className="h-4 w-4 rounded border-[#272d3f] bg-[#0c0e14] text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0 disabled:opacity-30"
                />

                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${file.isRecommended ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#1c1f28] text-slate-300'}`}>
                  {file.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-white truncate">{file.name}</p>
                    {file.isRecommended && (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                        ★ RECOMMENDED MASTER
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{file.path}</p>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <p className="font-mono text-xs font-bold text-white">{formatBytes(file.size)}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {file.dimensions || (file.pages ? `${file.pages} pgs` : '100% Quality')}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-3 border-t border-[#242830] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Selected for quarantine: <strong className="text-white font-mono">{selectedIds.length} copies</strong> (
            <span className="text-emerald-400 font-mono">+{formatBytes(selectedBytes)}</span> reclaimable)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              disabled={!selectedIds.length || quarantineMutation.isPending}
              onClick={() => quarantineMutation.mutate(selectedIds)}
              className="text-xs font-bold"
            >
              <Archive size={13} />
              <span>Quarantine Selected ({selectedIds.length})</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {inspectImageOpen && (
        <ImageCompareModal
          group={group}
          isOpen={inspectImageOpen}
          onClose={() => setInspectImageOpen(false)}
        />
      )}

      {docDiffOpen && (
        <DocumentDiffViewer
          group={group}
          isOpen={docDiffOpen}
          onClose={() => setDocDiffOpen(false)}
        />
      )}
    </div>
  )
}
