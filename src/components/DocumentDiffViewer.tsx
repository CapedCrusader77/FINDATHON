import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitCompare, Plus, Minus, Check, Copy, Search, ShieldCheck, X } from 'lucide-react'
import { DuplicateGroup } from '../types'
import { Badge, Button } from './ui'

interface DocumentDiffViewerProps {
  group: DuplicateGroup
  isOpen: boolean
  onClose: () => void
}

export default function DocumentDiffViewer({ group, isOpen, onClose }: DocumentDiffViewerProps) {
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified')
  const [searchQuery, setSearchQuery] = useState('')
  const [copied, setCopied] = useState(false)

  if (!isOpen || !group.diffData) return null

  const { fileA, fileB, segments, wordOverlap, addedLines, removedLines } = group.diffData

  const filteredSegments = segments.filter(seg =>
    searchQuery ? seg.text.toLowerCase().includes(searchQuery.toLowerCase()) : true
  )

  const handleCopyClean = () => {
    const cleanText = segments
      .filter(s => s.type !== 'removed')
      .map(s => s.text.replace(/^[+-]\s*/, ''))
      .join('\n')
    navigator.clipboard.writeText(cleanText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Main Diff Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#222634] bg-[#11141d] shadow-2xl"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1e2230] bg-[#0c0e14]/90 px-5 py-3.5 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30">
                <GitCompare size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">{group.title}</h3>
                  <Badge tone="purple">Cross-Format Text Diff</Badge>
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/25">
                    {wordOverlap}% Overlap
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Comparing <span className="font-semibold text-rose-300 font-mono">{fileA}</span> with <span className="font-semibold text-emerald-300 font-mono">{fileB}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-lg border border-[#222634] bg-[#0c0e14] p-0.5 text-xs">
                <button
                  onClick={() => setViewMode('unified')}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === 'unified' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Unified Diff
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`rounded px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === 'split' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>

              {/* Copy Button */}
              <Button variant="outline" size="xs" onClick={handleCopyClean} className="text-slate-300 h-7.5">
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied Master' : 'Copy Master'}</span>
              </Button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="grid h-7.5 w-7.5 place-items-center rounded-lg border border-[#222634] text-slate-400 hover:bg-[#1b1f2b] hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Diff Stats Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e2230] bg-[#0c0e14] px-5 py-2 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 font-semibold text-emerald-400 text-xs">
                <Plus size={13} /> +{addedLines} additions
              </span>
              <span className="flex items-center gap-1 font-semibold text-rose-400 text-xs">
                <Minus size={13} /> -{removedLines} deletions
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 text-[11px] font-mono">
                NLP N-gram Tokenizer + Levenshtein Alignment
              </span>
            </div>

            {/* Search bar */}
            <div className="flex items-center gap-2 rounded-md border border-[#222634] bg-[#11141d] px-2.5 py-1 text-xs">
              <Search size={12} className="text-slate-500" />
              <input
                type="text"
                placeholder="Filter clauses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-transparent text-white placeholder-slate-500 outline-none w-32 sm:w-44 text-[11px]"
              />
            </div>
          </div>

          {/* Diff Body Content */}
          <div className="flex-1 overflow-y-auto bg-[#0c0e14] p-4 font-mono text-xs leading-relaxed">
            {viewMode === 'unified' ? (
              <div className="space-y-0.5 rounded-lg border border-[#1e2230] bg-[#11141d] p-3">
                {filteredSegments.map((segment, idx) => {
                  const isAdded = segment.type === 'added'
                  const isRemoved = segment.type === 'removed'

                  return (
                    <div
                      key={idx}
                      className={`flex items-start rounded px-2.5 py-1 transition-colors ${
                        isAdded
                          ? 'bg-emerald-950/30 text-emerald-300 border-l-2 border-emerald-500'
                          : isRemoved
                          ? 'bg-rose-950/30 text-rose-300 border-l-2 border-rose-500 line-through opacity-75'
                          : 'text-slate-300 hover:bg-white/[0.02]'
                      }`}
                    >
                      <span className="w-7 shrink-0 select-none text-slate-600 font-mono text-[10px]">
                        {idx + 1}
                      </span>
                      <span className="w-4 shrink-0 select-none font-bold">
                        {isAdded ? '+' : isRemoved ? '-' : ' '}
                      </span>
                      <pre className="flex-1 whitespace-pre-wrap font-mono text-[11px]">{segment.text}</pre>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* Split Side-by-Side View */
              <div className="grid grid-cols-2 gap-3">
                {/* Draft / File A */}
                <div className="rounded-lg border border-[#1e2230] bg-[#11141d] p-3">
                  <div className="mb-2.5 flex items-center justify-between border-b border-[#1e2230] pb-2 text-xs font-semibold text-rose-300">
                    <span className="truncate">{fileA}</span>
                    <span className="rounded bg-rose-500/10 px-1.5 py-0.5 text-[9px] text-rose-400">Previous</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {filteredSegments
                      .filter(s => s.type !== 'added')
                      .map((segment, idx) => (
                        <div
                          key={idx}
                          className={`rounded px-2 py-0.5 ${
                            segment.type === 'removed'
                              ? 'bg-rose-950/40 text-rose-300 border-l-2 border-rose-500 line-through'
                              : 'text-slate-400'
                          }`}
                        >
                          <pre className="whitespace-pre-wrap">{segment.text}</pre>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Master / File B */}
                <div className="rounded-lg border border-emerald-500/25 bg-[#11141d] p-3">
                  <div className="mb-2.5 flex items-center justify-between border-b border-emerald-500/20 pb-2 text-xs font-semibold text-emerald-300">
                    <span className="truncate">★ Master: {fileB}</span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] text-emerald-300 font-bold">Master</span>
                  </div>
                  <div className="space-y-1 font-mono text-[11px]">
                    {filteredSegments
                      .filter(s => s.type !== 'removed')
                      .map((segment, idx) => (
                        <div
                          key={idx}
                          className={`rounded px-2 py-0.5 ${
                            segment.type === 'added'
                              ? 'bg-emerald-950/40 text-emerald-300 border-l-2 border-emerald-500'
                              : 'text-slate-300'
                          }`}
                        >
                          <pre className="whitespace-pre-wrap">{segment.text}</pre>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between border-t border-[#1e2230] bg-[#0c0e14] px-5 py-2.5 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span className="text-[11px]">Retaining Master copy preserves all recent edits and citations.</span>
            </div>
            <Button size="sm" onClick={onClose} className="bg-brand-600 hover:bg-brand-500 text-white text-xs h-7.5">
              Done Reviewing
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
