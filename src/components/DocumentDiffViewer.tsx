import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, GitCompare, Plus, Minus, Check, Copy, FileCode, Layers, Search, Sparkles, BookOpen, ShieldCheck } from 'lucide-react'
import { DuplicateGroup, DiffSegment } from '../types'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
      />

      {/* Main Diff Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0f172a] shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-900/90 px-6 py-4 backdrop-blur-lg">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-glow">
              <GitCompare size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-tight">{group.title}</h3>
                <Badge tone="purple">Cross-Format Text Diff</Badge>
                <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
                  {wordOverlap}% Overlap
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Comparing <span className="font-semibold text-rose-300">{fileA}</span> with <span className="font-semibold text-emerald-300">{fileB}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-white/10 bg-slate-800/80 p-1">
              <button
                onClick={() => setViewMode('unified')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  viewMode === 'unified' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Unified Diff
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                  viewMode === 'split' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Side-by-Side
              </button>
            </div>

            {/* Copy Button */}
            <Button variant="outline" size="sm" onClick={handleCopyClean} className="text-slate-300 border-white/10">
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied Master' : 'Copy Clean Text'}
            </Button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-slate-800 text-slate-400 hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Diff Stats Banner */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-slate-950/60 px-6 py-2.5 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <Plus size={14} /> +{addedLines} additions
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-rose-400">
              <Minus size={14} /> -{removedLines} deletions
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">
              Algorithm: Normalized Token Levenshtein + Sentence-BERT Embedding
            </span>
          </div>

          {/* Search bar inside diff */}
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-2.5 py-1 text-xs">
            <Search size={13} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search diff clauses..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-slate-500 outline-none w-36 sm:w-48"
            />
          </div>
        </div>

        {/* Diff Body Content */}
        <div className="flex-1 overflow-y-auto bg-[#090d16] p-6 font-mono text-xs leading-relaxed">
          {viewMode === 'unified' ? (
            <div className="space-y-1 rounded-xl border border-white/10 bg-slate-950/70 p-4">
              {filteredSegments.map((segment, idx) => {
                const isAdded = segment.type === 'added'
                const isRemoved = segment.type === 'removed'

                return (
                  <div
                    key={idx}
                    className={`flex items-start rounded px-3 py-1.5 transition-colors ${
                      isAdded
                        ? 'bg-emerald-950/40 text-emerald-300 border-l-4 border-emerald-500'
                        : isRemoved
                        ? 'bg-rose-950/40 text-rose-300 border-l-4 border-rose-500 line-through opacity-80'
                        : 'text-slate-300 hover:bg-white/[0.02]'
                    }`}
                  >
                    <span className="w-8 shrink-0 select-none text-slate-600 font-mono text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="w-5 shrink-0 select-none font-bold">
                      {isAdded ? '+' : isRemoved ? '-' : ' '}
                    </span>
                    <pre className="flex-1 whitespace-pre-wrap font-mono">{segment.text}</pre>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Split Side-by-Side View */
            <div className="grid grid-cols-2 gap-4">
              {/* Draft / File A */}
              <div className="rounded-xl border border-white/10 bg-slate-950/70 p-4">
                <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 text-xs font-semibold text-rose-300 font-sans">
                  <span>Older Draft ({fileA})</span>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] text-rose-400">Previous</span>
                </div>
                <div className="space-y-1.5 font-mono">
                  {filteredSegments
                    .filter(s => s.type !== 'added')
                    .map((segment, idx) => (
                      <div
                        key={idx}
                        className={`rounded px-2.5 py-1 ${
                          segment.type === 'removed'
                            ? 'bg-rose-950/50 text-rose-300 border-l-2 border-rose-500 line-through'
                            : 'text-slate-400'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap">{segment.text}</pre>
                      </div>
                    ))}
                </div>
              </div>

              {/* Master / File B */}
              <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-4">
                <div className="mb-3 flex items-center justify-between border-b border-emerald-500/20 pb-2 text-xs font-semibold text-emerald-300 font-sans">
                  <span>★ Master Version ({fileB})</span>
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">Recommended</span>
                </div>
                <div className="space-y-1.5 font-mono">
                  {filteredSegments
                    .filter(s => s.type !== 'removed')
                    .map((segment, idx) => (
                      <div
                        key={idx}
                        className={`rounded px-2.5 py-1 ${
                          segment.type === 'added'
                            ? 'bg-emerald-950/50 text-emerald-300 border-l-2 border-emerald-500'
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
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-900/90 px-6 py-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck size={15} className="text-emerald-400" />
            <span>Retaining the Master document preserves all latest paragraphs and citation additions.</span>
          </div>
          <Button variant="default" size="sm" onClick={onClose} className="bg-indigo-600 text-white">
            Done Reviewing
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
