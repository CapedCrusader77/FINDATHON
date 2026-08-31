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
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2230] pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-display">
            {filter === 'image' ? 'Image Duplicate Clusters' : filter === 'document' ? 'Document Revisions & Drafts' : 'Duplicate Groups & Clusters'}
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Algorithmic duplicate clusters with explainable matching reasons and master copy recommendations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/scan">
            <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white font-semibold">
              <FolderOpen size={13} />
              <span>Scan Folder</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Control Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#11141d] p-3 rounded-lg border border-[#1e2230]">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {['All', 'Exact', 'Images', 'Documents', 'High Confidence'].map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${tab === item
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-400 hover:bg-[#161922] hover:text-white'
                }`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search size={13} className="absolute left-2.5 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Filter clusters..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-md border border-[#272d3f] bg-[#0c0e14] pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-brand-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-md border border-[#272d3f] bg-[#0c0e14] px-2.5 py-1.5 text-xs text-slate-300 outline-none focus:border-brand-500"
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
          <RefreshCw size={14} className="animate-spin text-brand-400 mr-2" />
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
        <Card className="p-8 text-center bg-[#11141d] border-[#1e2230]">
          <p className="text-sm font-bold text-white">No duplicate clusters found</p>
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
  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
  const isImage = group.type === 'Near image' || group.category === 'image'
  const isDoc = group.type === 'Near document' || group.type === 'Semantic match' || group.category === 'document'

  return (
    <Card className="p-5 bg-[#11141d] border-[#1e2230] hover:border-[#2d3448] transition-colors">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#1e2230] pb-3.5">
        <div className="flex items-start gap-3 min-w-0">
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#1d2230] text-slate-300 border border-[#272d3f]">
            {isImage ? <ImageIcon size={16} /> : <FileText size={16} />}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">{group.title}</h3>
              <Badge tone={group.type === 'Exact' ? 'blue' : isImage ? 'purple' : 'green'}>
                {group.type}
              </Badge>
              <span className="font-mono text-[11px] font-bold text-brand-400">
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
      <div className="mt-3.5 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Files in this Cluster ({group.files.length})
        </p>

        <div className="space-y-1.5">
          {group.files.map(file => (
            <div
              key={file.id}
              className={`flex items-center justify-between rounded-md p-2.5 text-xs transition-colors ${file.isRecommended
                  ? 'bg-emerald-950/20 border border-emerald-500/30'
                  : 'bg-[#0c0e14] border border-[#1e2230]'
                }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {file.isRecommended ? (
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-emerald-500 text-slate-950 font-bold text-[10px]" title="Recommended Master Copy">
                    ★
                  </span>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-slate-600 shrink-0 ml-1.5" />
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white truncate text-xs">{file.name}</p>
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
                <p className="font-mono text-xs font-semibold text-slate-300">{formatBytes(file.size)}</p>
                <p className="text-[10px] text-slate-500">
                  {file.dimensions || (file.pages ? `${file.pages} pgs` : '100% Quality')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#1e2230] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-slate-400">
          Recommendation: <span className="text-emerald-300 font-medium">{group.recommendationReason}</span>
        </div>

        <div className="flex items-center gap-2">
          {isImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInspectImage}
              className="text-xs h-7.5"
            >
              <Sliders size={12} />
              <span>Split Slider</span>
            </Button>
          )}

          {isDoc && group.diffData && (
            <Button
              variant="outline"
              size="sm"
              onClick={onInspectDoc}
              className="text-xs h-7.5"
            >
              <GitCompare size={12} />
              <span>View Diff</span>
            </Button>
          )}

          <Link to={`/groups/${group.id}`}>
            <Button size="sm" className="bg-brand-600 hover:bg-brand-500 text-white text-xs h-7.5">
              <span>Review Cluster</span>
              <ChevronRight size={13} />
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
