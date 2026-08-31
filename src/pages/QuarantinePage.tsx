import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Archive,
  Undo2,
  Trash2,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  RefreshCw
} from 'lucide-react'
import { fetchQuarantine, restoreFile, deleteQuarantinedFile } from '../lib/api'
import { formatBytes } from '../lib/utils'
import { QuarantineItem } from '../types'
import { Card, SectionTitle, Button, Badge } from '../components/ui'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

export default function QuarantinePage() {
  const queryClient = useQueryClient()
  const { pushToast } = useToast()
  const { user } = useAuth()

  const { data: items = [], isLoading, refetch } = useQuery<QuarantineItem[]>({
    queryKey: ['quarantine', user?.email],
    queryFn: () => fetchQuarantine(user?.email)
  })

  const totalBytes = items.reduce((sum, item) => sum + item.size, 0)

  const restoreMutation = useMutation({
    mutationFn: restoreFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      pushToast('File restored to original directory path.', 'info')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: deleteQuarantinedFile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarantine'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      pushToast('File permanently removed from quarantine bin.', 'info')
    }
  })

  const handleRestoreAll = async () => {
    for (const item of items) {
      await restoreFile(item.id)
    }
    refetch()
    queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    pushToast('All quarantined files restored to their original locations.', 'info')
  }

  const handleEmptyQuarantine = async () => {
    if (window.confirm(`Permanently delete ${items.length} files from quarantine? This action cannot be undone.`)) {
      for (const item of items) {
        await deleteQuarantinedFile(item.id)
      }
      refetch()
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      pushToast('Quarantine bin emptied permanently.', 'info')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Safe Quarantine Bin
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Files staged here are isolated and can be safely restored to their original folder at any time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <Button
                variant="glass"
                size="sm"
                onClick={handleRestoreAll}
                className="text-xs"
              >
                <Undo2 size={13} />
                <span>Restore All</span>
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handleEmptyQuarantine}
                className="text-xs rounded-xl"
              >
                <Trash2 size={13} />
                <span>Empty Bin</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Notice Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 backdrop-blur-xl">
        <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
        <p className="leading-relaxed">
          <strong>Non-Destructive Staging:</strong> Quarantined duplicate copies remain intact on your local drive. No file is purged without explicit confirmation.
        </p>
      </div>

      {/* Main Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Staged Candidate Files
            </span>
            <Badge tone="amber">{items.length} Files</Badge>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            Recoverable Space: <strong className="text-emerald-400">{formatBytes(totalBytes)}</strong>
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-xs text-slate-400 font-mono">
            <RefreshCw size={15} className="animate-spin text-blue-400 mr-2" />
            Loading quarantine records...
          </div>
        ) : items.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {items.map(item => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white">
                    {item.type === 'image' ? <ImageIcon size={16} /> : <FileText size={16} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                      <span className="rounded-md bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-slate-300 border border-white/[0.08]">
                        From {item.groupTitle}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-slate-400 truncate mt-0.5">{item.originalPath}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-12 sm:pl-0">
                  <div className="text-left sm:text-right">
                    <p className="font-mono text-xs font-semibold text-slate-200">{formatBytes(item.size)}</p>
                    <p className="text-[10px] text-slate-400">Safe restore ready</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="glass"
                      size="xs"
                      disabled={restoreMutation.isPending}
                      onClick={() => restoreMutation.mutate(item.id)}
                      className="text-blue-300 hover:text-white"
                      title="Restore to original folder"
                    >
                      <Undo2 size={12} />
                      <span>Restore</span>
                    </Button>

                    <button
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (window.confirm(`Permanently delete ${item.name}?`)) {
                          deleteMutation.mutate(item.id)
                        }
                      }}
                      className="grid h-7.5 w-7.5 place-items-center rounded-xl border border-white/[0.12] text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition-colors"
                      title="Permanently remove"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400">
            Quarantine bin is empty. No files are currently staged for removal.
          </div>
        )}
      </Card>
    </div>
  )
}
