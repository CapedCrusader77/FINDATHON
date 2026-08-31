import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Clock3,
  FolderOpen,
  RefreshCw,
  CheckCircle2,
  HardDrive
} from 'lucide-react'
import { fetchHistory } from '../lib/api'
import { formatBytes, formatDate } from '../lib/utils'
import { ScanRecord } from '../types'
import { Card, SectionTitle, Badge, Button } from '../components/ui'
import { useAuth } from '../context/AuthContext'

export default function HistoryPage() {
  const { user } = useAuth()
  const { data: history = [], isLoading, refetch } = useQuery<ScanRecord[]>({
    queryKey: ['history', user?.email],
    queryFn: () => fetchHistory(user?.email)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-display">
            Scan Audit History
          </h2>
          <p className="mt-0.5 text-xs text-slate-400">
            Log of all previously executed duplicate detection passes and disk operations.
          </p>
        </div>

        <Button
          variant="glass"
          size="sm"
          onClick={() => refetch()}
          className="text-xs"
        >
          <RefreshCw size={12} />
          <span>Refresh History</span>
        </Button>
      </div>

      {/* Audit Table Card */}
      <Card className="p-0 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_1fr] gap-4 border-b border-white/[0.08] bg-white/[0.02] px-6 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Target Directory</span>
          <span>Files Analyzed</span>
          <span>Clusters Detected</span>
          <span>Recovered</span>
          <span>Execution Date</span>
        </div>

        {isLoading ? (
          <div className="flex h-36 items-center justify-center text-xs text-slate-400 font-mono">
            <RefreshCw size={15} className="animate-spin text-blue-400 mr-2" />
            Loading scan audit records...
          </div>
        ) : history.length > 0 ? (
          <div className="divide-y divide-white/[0.06]">
            {history.map(scan => (
              <div
                key={scan.id}
                className="grid gap-2 sm:gap-4 sm:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_1fr] sm:items-center p-4 hover:bg-white/[0.04] transition-colors text-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-white">
                    <FolderOpen size={15} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate text-xs">{scan.name}</p>
                    <p className="font-mono text-[10px] text-slate-400">{formatBytes(scan.size)} total</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:block">
                  <span className="text-slate-400 sm:hidden">Files:</span>
                  <span className="font-mono text-slate-200">{scan.files.toLocaleString()} files</span>
                </div>

                <div className="flex items-center justify-between sm:block">
                  <span className="text-slate-400 sm:hidden">Clusters:</span>
                  <span className="font-semibold text-blue-300">{scan.groups} clusters</span>
                </div>

                <div className="flex items-center justify-between sm:block">
                  <span className="text-slate-400 sm:hidden">Recovered:</span>
                  <span className="font-mono font-bold text-emerald-400">{formatBytes(scan.recovered)}</span>
                </div>

                <div className="flex items-center justify-between sm:block">
                  <span className="text-slate-400 sm:hidden">Date:</span>
                  <span className="text-slate-400 font-mono text-[11px]">{formatDate(scan.date)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400">
            No previous scan history records found in this workspace.
          </div>
        )}
      </Card>
    </div>
  )
}
