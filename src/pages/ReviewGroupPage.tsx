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
  Check
} from 'lucide-react'
import { fetchGroups, quarantineFile } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { DuplicateGroup } from '../types'
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

  // Preselect non-master copies by default
  useEffect(() => {
    if (group) {
      const nonMasters = group.files.filter(f => !f.isRecommended).map(f => f.id)
      setSelectedIds(nonMasters)
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
      pushToast(`Staged ${selectedIds.length} duplicate files into safe quarantine.`, 'info')
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
          <p className="text-sm font-bold text-white">Cluster Not Found</p>
          <p className="mt-1 text-xs text-slate-400">This duplicate cluster has already been resolved or does not exist.</p>
        </Card>
      </div>
    )
  }

  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
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

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1e2230] pb-5">
        <div>
          <Link
            to="/groups"
            className="mb-2 text-xs font-semibold text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Groups
          </Link>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <h2 className="text-xl font-bold tracking-tight text-white font-display">
              {group.title}
            </h2>
            <Badge tone={group.type === 'Exact' ? 'blue' : isImage ? 'purple' : 'green'}>
              {group.type}
            </Badge>
            <span className="font-mono text-xs font-bold text-brand-400">
              {group.similarity}% Algorithmic Match
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            {group.files.length} candidate files · {formatBytes(group.recoverable)} recoverable storage
          </p>
        </div>

        {/* Top Actions */}
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

      {/* Main Review Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        {/* Left Column: Files Table */}
        <Card className="p-5 bg-[#11141d] border-[#1e2230]">
          <div className="flex items-center justify-between border-b border-[#1e2230] pb-3 mb-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Candidate Files ({group.files.length})
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Check copies to move to safe quarantine. The master file is retained.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedIds(group.files.filter(f => !f.isRecommended).map(f => f.id))}
                className="text-brand-400 hover:underline font-medium text-[11px]"
              >
                Keep Master Only
              </button>
              <span className="text-slate-600">|</span>
              <button
                onClick={() => setSelectedIds([])}
                className="text-slate-400 hover:text-white font-medium text-[11px]"
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
                  className={`flex items-center gap-3.5 rounded-lg p-3 border transition-colors ${
                    file.isRecommended
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : isSelected
                      ? 'bg-[#181d29] border-[#2f374e]'
                      : 'bg-[#0c0e14] border-[#1e2230]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelect(file.id)}
                    className="h-4 w-4 rounded border-[#272d3f] bg-[#0c0e14] text-brand-600 focus:ring-brand-500 cursor-pointer shrink-0"
                  />

                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-[#222738] text-slate-300">
                    {file.type === 'image' ? <ImageIcon size={15} /> : <FileText size={15} />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                      {file.isRecommended && (
                        <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                          ★ RECOMMENDED MASTER
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{file.path}</p>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p className="font-mono text-xs font-bold text-white">{formatBytes(file.size)}</p>
                    <p className="text-[10px] text-slate-500">
                      {file.dimensions || (file.pages ? `${file.pages} pgs` : '100% Quality')}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#1e2230] flex items-center justify-between text-xs text-slate-400">
            <span>
              Selected for quarantine: <strong className="text-white font-mono">{selectedIds.length} files</strong>
            </span>
            <span>
              Space to reclaim: <strong className="text-emerald-400 font-mono">{formatBytes(selectedBytes)}</strong>
            </span>
          </div>
        </Card>

        {/* Right Column: Explanation & Master Recommendation */}
        <div className="space-y-4">
          {/* Why Matched */}
          <Card className="p-5 bg-[#11141d] border-[#1e2230]">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-brand-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                Matching Signals
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {group.explanation}
            </p>

            <div className="space-y-2">
              {group.signals.map(signal => (
                <div
                  key={signal.label}
                  className="flex items-center justify-between rounded-md border border-[#1e2230] bg-[#161922] p-2.5 text-xs"
                >
                  <span className="text-slate-300 text-[11px]">{signal.label}</span>
                  {signal.score ? (
                    <span className="font-mono font-bold text-brand-400 text-xs">{signal.score}%</span>
                  ) : (
                    <span className="font-semibold text-emerald-400 text-[11px]">✓ Confirmed</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Master Recommendation Card */}
          <Card className="p-5 bg-gradient-to-br from-emerald-950/20 to-[#11141d] border border-emerald-500/30">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Master Copy Retention</span>
            </div>

            <h4 className="text-sm font-bold text-white">
              Retaining {masterFile.name}
            </h4>

            <p className="mt-1.5 text-xs text-emerald-200/80 leading-relaxed">
              {group.recommendationReason}
            </p>

            <div className="mt-4 border-t border-emerald-500/20 pt-3 text-[11px] text-emerald-300/80">
              Zero risk: Quarantined files are kept for 30 days and can be restored at any time.
            </div>
          </Card>
        </div>
      </div>

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
