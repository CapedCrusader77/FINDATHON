import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Copy as CopyIcon,
  Search,
  Sliders,
  GitCompare,
  ArrowRight,
  Sparkles,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Star,
  RefreshCw,
  FolderOpen
} from 'lucide-react'
import { fetchGroups } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { DuplicateGroup } from '../types'
import { Card, SectionTitle, Button, Badge, Input } from '../components/ui'
import ImageCompareModal from '../components/ImageCompareModal'
import DocumentDiffViewer from '../components/DocumentDiffViewer'
import { useAuth } from '../context/AuthContext'

export default function DuplicateGroupsPage({ filter }: { filter?: 'image' | 'document' } = {}) {
  const { user } = useAuth()
  const { data: groups = [], isLoading, refetch } = useQuery<DuplicateGroup[]>({
    queryKey: ['groups', user?.email],
    queryFn: () => fetchGroups(user?.email)
  })

  const [tab, setTab] = useState<string>('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'recoverable' | 'similarity' | 'count'>('recoverable')
  const [inspectImageGroup, setInspectImageGroup] = useState<DuplicateGroup | null>(null)
  const [inspectDocGroup, setInspectDocGroup] = useState<DuplicateGroup | null>(null)

  const filtered = useMemo(() => {
    return groups
      .filter(g => (!filter ? true : filter === 'image' ? g.category === 'image' || g.type === 'Near image' : g.category === 'document' || g.type === 'Near document' || g.type === 'Semantic match'))
      .filter(g => {
        if (tab === 'All') return true
        if (tab === 'Exact') return g.type === 'Exact'
        if (tab === 'Images') return g.type === 'Near image'
        if (tab === 'Documents') return g.type === 'Near document' || g.type === 'Semantic match'
        if (tab === 'High Confidence') return g.similarity >= 95
        return true
      })
      .filter(g => {
        if (!search.trim()) return true
        const q = search.toLowerCase()
        return (
          g.title.toLowerCase().includes(q) ||
          g.explanation.toLowerCase().includes(q) ||
          g.files.some(f => f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q))
        )
      })
      .sort((a, b) => {
        if (sortBy === 'recoverable') return b.recoverable - a.recoverable
        if (sortBy === 'similarity') return b.similarity - a.similarity
        if (sortBy === 'count') return b.files.length - a.files.length
        return 0
      })
  }, [groups, filter, tab, search, sortBy])

  const totalRecoverable = useMemo(() => {
    return filtered.reduce((sum, g) => sum + g.recoverable, 0)
  }, [filtered])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            {filter === 'image' ? 'Image Duplicate Clusters' : filter === 'document' ? 'Document Revisions & Drafts' : 'Duplicate Groups & Clusters'}
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Algorithmic duplicate clusters with explainable matching reasons and master copy recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/scan">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-glowBlue rounded-xl">
              <FolderOpen size={13} />
              <span>Scan Folder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 rounded-2xl border border-white/[0.10] bg-white/[0.03] backdrop-blur-xl">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Exact', 'Images', 'Documents', 'High Confidence'].map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold whitespace-nowrap transition-all ${
                tab === item
                  ? 'bg-blue-600 text-white shadow-glowBlue'
                  : 'text-slate-400 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search size={13} className="absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter clusters..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/[0.12] bg-white/[0.04] pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-xl border border-white/[0.12] bg-[#0c101d] px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-blue-500"
          >
            <option value="recoverable">Sort: Recoverable Space</option>
            <option value="similarity">Sort: Similarity Score</option>
            <option value="count">Sort: File Count</option>
          </select>
        </div>
      </div>

      {/* Summary Stat Strip */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white font-mono">{filtered.length}</strong> duplicate clusters
        </span>
        <span>
          Potential Recovery: <strong className="text-emerald-400 font-mono">{formatBytes(totalRecoverable)}</strong>
        </span>
      </div>

      {/* Cluster List */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-xs text-slate-400 font-mono">
          <RefreshCw size={15} className="animate-spin text-blue-400 mr-2" />
          Loading duplicate clusters...
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(group => (
            <GroupRowCard
              key={group.id}
              group={group}
              onInspectImage={() => setInspectImageGroup(group)}
              onInspectDoc={() => setInspectDocGroup(group)}
            />
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-base font-bold text-white">No duplicate clusters found</p>
          <p className="mt-1 text-xs text-slate-400">
            {search.trim() || tab !== 'All'
              ? 'No duplicates match the current filters. Try changing keywords or category tab.'
              : 'Your workspace currently has no duplicate files detected. Run a scan to discover duplicates.'}
          </p>
        </Card>
      )}

      {/* Interactive Modals */}
      {inspectImageGroup && (
        <ImageCompareModal
          group={inspectImageGroup}
          isOpen={Boolean(inspectImageGroup)}
          onClose={() => setInspectImageGroup(null)}
        />
      )}

      {inspectDocGroup && (
        <DocumentDiffViewer
          group={inspectDocGroup}
          isOpen={Boolean(inspectDocGroup)}
          onClose={() => setInspectDocGroup(null)}
        />
      )}
    </div>
  )
}

function GroupRowCard({
  group,
  onInspectImage,
  onInspectDoc
}: {
  group: DuplicateGroup
  onInspectImage: () => void
  onInspectDoc: () => void
}) {
  const isImage = group.type === 'Near image' || group.category === 'image'
  const isDoc = group.type === 'Near document' || group.type === 'Semantic match' || group.category === 'document'

  return (
    <Card className="p-6 transition-all hover:border-white/[0.22]">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-white/[0.08] pb-4">
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/[0.06] text-white border border-white/[0.10]">
            {isImage ? <ImageIcon size={18} /> : <FileText size={18} />}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-sm font-bold text-white truncate">{group.title}</h3>
              <Badge tone={group.type === 'Exact' ? 'blue' : isImage ? 'purple' : 'green'}>
                {group.type}
              </Badge>
              <span className="font-mono text-xs font-bold text-blue-400">
                {group.similarity}% Match
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {group.explanation}
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <p className="text-sm font-mono font-bold text-emerald-400">{formatBytes(group.recoverable)}</p>
          <p className="text-[10px] text-slate-400">recoverable storage</p>
        </div>
      </div>

      {/* Candidate Files List */}
      <div className="mt-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
          Files in this Cluster ({group.files.length})
        </p>

        <div className="space-y-2">
          {group.files.map(file => (
            <div
              key={file.id}
              className={`flex items-center justify-between rounded-xl p-3 text-xs transition-colors ${
                file.isRecommended
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-white/[0.02] border border-white/[0.06]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {file.isRecommended ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-emerald-500 text-slate-950 font-bold text-[10px] shadow-sm" title="Recommended Master Copy">
                    ★
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-500 shrink-0 ml-1.5" />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-white truncate text-xs">{file.name}</p>
                    {file.isRecommended && (
                      <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
                        Master Copy
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{file.path}</p>
                </div>
              </div>

              <div className="text-right shrink-0 pl-3">
                <p className="font-mono text-xs font-semibold text-slate-200">{formatBytes(file.size)}</p>
                <p className="text-[10px] text-slate-400">
                  {file.dimensions || (file.pages ? `${file.pages} pgs` : '100% Quality')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3.5 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Recommendation: <span className="text-emerald-300 font-medium">{group.recommendationReason}</span>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <Button
              variant="glass"
              size="sm"
              onClick={onInspectImage}
              className="text-xs h-8"
            >
              <Sliders size={12} />
              <span>Split Slider</span>
            </Button>
          )}

          {isDoc && group.diffData && (
            <Button
              variant="glass"
              size="sm"
              onClick={onInspectDoc}
              className="text-xs h-8"
            >
              <GitCompare size={12} />
              <span>View Diff</span>
            </Button>
          )}

          <Link to={`/groups/${group.id}`}>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-8 shadow-glowBlue rounded-xl">
              <span>Review Cluster</span>
              <ChevronRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
