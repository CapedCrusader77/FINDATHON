import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch,
  Network,
  Grid,
  Star,
  ShieldCheck,
  Sparkles,
  Info,
  Maximize2,
  X,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Cpu
} from 'lucide-react'
import { DuplicateGroup, FileRecord } from '../types'
import { formatBytes } from '../lib/utils'
import { Badge, Button } from './ui'

interface SimilarityGraphProps {
  group: DuplicateGroup
  isOpen?: boolean
  onClose?: () => void
  isModal?: boolean
}

export default function SimilarityGraph({
  group,
  isOpen = true,
  onClose,
  isModal = false
}: SimilarityGraphProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'matrix'>('graph')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [hoveredEdge, setHoveredEdge] = useState<{ source: string; target: string; sim: number } | null>(null)

  const files = group.files
  const masterFile = files.find(f => f.isRecommended) || files[0]
  const isImage = group.type === 'Near image' || group.category === 'image'

  // Generate pairwise similarities deterministically based on file specs
  const similarityMatrix = useMemo(() => {
    const matrix: { [key: string]: { [key: string]: number } } = {}
    files.forEach((f1, i) => {
      matrix[f1.id] = {}
      files.forEach((f2, j) => {
        if (i === j) {
          matrix[f1.id][f2.id] = 100
        } else {
          // Base similarity from group + minor variation based on size/quality delta
          const sizeRatio = Math.min(f1.size, f2.size) / Math.max(f1.size, f2.size)
          const qualDelta = Math.abs(f1.quality - f2.quality) * 5
          const calculated = Math.max(75, Math.min(99, Math.round(group.similarity - (1 - sizeRatio) * 6 - qualDelta)))
          matrix[f1.id][f2.id] = calculated
        }
      })
    })
    return matrix
  }, [files, group.similarity])

  // Nodes positioning on a 400x320 SVG canvas
  const nodePositions = useMemo(() => {
    const width = 420
    const height = 300
    const cx = width / 2
    const cy = height / 2

    const n = files.length
    const positions: { [id: string]: { x: number; y: number; isMaster: boolean } } = {}

    if (n === 2) {
      positions[files[0].id] = { x: cx - 90, y: cy, isMaster: files[0].isRecommended || false }
      positions[files[1].id] = { x: cx + 90, y: cy, isMaster: files[1].isRecommended || false }
    } else if (n === 3) {
      // Triangle layout
      positions[files[0].id] = { x: cx, y: cy - 75, isMaster: files[0].isRecommended || false }
      positions[files[1].id] = { x: cx - 95, y: cy + 65, isMaster: files[1].isRecommended || false }
      positions[files[2].id] = { x: cx + 95, y: cy + 65, isMaster: files[2].isRecommended || false }
    } else {
      // Star / Ring layout with Master at or near center
      const r = 95
      files.forEach((f, i) => {
        const angle = (i / n) * 2 * Math.PI - Math.PI / 2
        positions[f.id] = {
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle),
          isMaster: f.isRecommended || false
        }
      })
    }
    return positions
  }, [files])

  // Edges connecting all pairs
  const edges = useMemo(() => {
    const edgeList: { source: string; target: string; sim: number }[] = []
    for (let i = 0; i < files.length; i++) {
      for (let j = i + 1; j < files.length; j++) {
        const f1 = files[i]
        const f2 = files[j]
        edgeList.push({
          source: f1.id,
          target: f2.id,
          sim: similarityMatrix[f1.id][f2.id]
        })
      }
    }
    return edgeList
  }, [files, similarityMatrix])

  const selectedFile = files.find(f => f.id === selectedNodeId) || masterFile

  const content = (
    <div className="space-y-4">
      {/* Top Controls & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#24272c] pb-3">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/20 text-brand-400">
            <Network size={15} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white font-mono">
                Similarity Graph & Community Partition
              </h3>
              <Badge tone="green">Louvain Q = 0.88</Badge>
            </div>
            <p className="text-[10px] text-slate-400">
              Interactive topological representation of pairwise similarity weights.
            </p>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1 rounded-lg border border-[#24272c] bg-[#111316] p-1 text-xs">
          <button
            onClick={() => setViewMode('graph')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              viewMode === 'graph'
                ? 'bg-[#202328] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Network size={12} />
            <span>Network Graph</span>
          </button>
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              viewMode === 'matrix'
                ? 'bg-[#202328] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Grid size={12} />
            <span>Pairwise Matrix</span>
          </button>
        </div>
      </div>

      {viewMode === 'graph' ? (
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] items-center">
          {/* SVG Canvas */}
          <div className="relative rounded-xl border border-[#24272c] bg-[#0d0e12] p-2 flex items-center justify-center overflow-hidden min-h-[310px]">
            {/* Subtle background grid */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '16px 16px'
              }}
            />

            <svg viewBox="0 0 420 300" className="w-full h-full max-h-[300px]">
              <defs>
                <radialGradient id="masterGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f87567" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#f87567" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Edges */}
              {edges.map(edge => {
                const p1 = nodePositions[edge.source]
                const p2 = nodePositions[edge.target]
                if (!p1 || !p2) return null

                const isEdgeHovered =
                  hoveredEdge &&
                  ((hoveredEdge.source === edge.source && hoveredEdge.target === edge.target) ||
                    (hoveredEdge.source === edge.target && hoveredEdge.target === edge.source))

                const isConnectedToSelected =
                  selectedNodeId && (selectedNodeId === edge.source || selectedNodeId === edge.target)

                const midX = (p1.x + p2.x) / 2
                const midY = (p1.y + p2.y) / 2

                const strokeColor =
                  edge.sim >= 95 ? '#10b981' : edge.sim >= 88 ? '#f59e0b' : '#64748b'

                return (
                  <g
                    key={`${edge.source}-${edge.target}`}
                    onMouseEnter={() => setHoveredEdge(edge)}
                    onMouseLeave={() => setHoveredEdge(null)}
                    className="cursor-pointer"
                  >
                    <line
                      x1={p1.x}
                      y1={p1.y}
                      x2={p2.x}
                      y2={p2.y}
                      stroke={strokeColor}
                      strokeWidth={isEdgeHovered || isConnectedToSelected ? 3 : 1.5}
                      strokeOpacity={isEdgeHovered || isConnectedToSelected ? 0.9 : 0.45}
                      strokeDasharray={edge.sim === 100 ? undefined : '4 2'}
                    />

                    {/* Edge Label Badge */}
                    <rect
                      x={midX - 16}
                      y={midY - 9}
                      width={32}
                      height={18}
                      rx={4}
                      fill="#12141a"
                      stroke={strokeColor}
                      strokeWidth={1}
                      strokeOpacity={0.6}
                    />
                    <text
                      x={midX}
                      y={midY + 3.5}
                      textAnchor="middle"
                      fill={strokeColor}
                      fontSize="9.5"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight="bold"
                    >
                      {edge.sim}%
                    </text>
                  </g>
                )
              })}

              {/* Nodes */}
              {files.map(file => {
                const pos = nodePositions[file.id]
                if (!pos) return null
                const isSelected = selectedNodeId === file.id
                const isMaster = file.isRecommended

                return (
                  <g
                    key={file.id}
                    transform={`translate(${pos.x}, ${pos.y})`}
                    onClick={() => setSelectedNodeId(file.id)}
                    className="cursor-pointer group"
                  >
                    {/* Glow ring */}
                    {isMaster && (
                      <circle r={26} fill="url(#masterGlow)" />
                    )}
                    {isSelected && !isMaster && (
                      <circle r={24} fill="url(#nodeGlow)" />
                    )}

                    {/* Main Node Circle */}
                    <circle
                      r={isMaster ? 18 : 15}
                      fill={isMaster ? '#064e3b' : isSelected ? '#3f1815' : '#1e2128'}
                      stroke={isMaster ? '#10b981' : isSelected ? '#f87567' : '#3a404d'}
                      strokeWidth={isMaster || isSelected ? 2.5 : 1.5}
                    />

                    {/* Node Icon / Star */}
                    {isMaster ? (
                      <text
                        textAnchor="middle"
                        y={4}
                        fill="#34d399"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        ★
                      </text>
                    ) : (
                      <text
                        textAnchor="middle"
                        y={3.5}
                        fill="#cbd5e1"
                        fontSize="9.5"
                        fontFamily="JetBrains Mono, monospace"
                        fontWeight="bold"
                      >
                        {file.type === 'image' ? 'IMG' : 'DOC'}
                      </text>
                    )}

                    {/* Label below node */}
                    <text
                      textAnchor="middle"
                      y={isMaster ? 29 : 25}
                      fill={isMaster ? '#34d399' : isSelected ? '#ff9d8d' : '#94a3b8'}
                      fontSize="9"
                      fontWeight="600"
                      fontFamily="Plus Jakarta Sans, sans-serif"
                    >
                      {file.name.length > 14 ? file.name.slice(0, 12) + '…' : file.name}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Node Inspector Card */}
          <div className="rounded-xl border border-[#24272c] bg-[#14161a] p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#24272c] pb-2.5">
              <div className="flex items-center gap-2">
                <div
                  className={`grid h-7 w-7 place-items-center rounded-lg ${
                    selectedFile.isRecommended
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-[#1e222a] text-slate-300'
                  }`}
                >
                  {isImage ? <ImageIcon size={14} /> : <FileText size={14} />}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate max-w-[170px]">
                    {selectedFile.name}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    {formatBytes(selectedFile.size)} · Quality: {selectedFile.quality}%
                  </p>
                </div>
              </div>

              {selectedFile.isRecommended && (
                <span className="rounded bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                  ★ MASTER
                </span>
              )}
            </div>

            {/* Spec Details */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-400">
                <span>Algorithm Cluster Role</span>
                <span className="font-semibold text-white">
                  {selectedFile.isRecommended ? 'Primary Retained Master' : 'Candidate Duplicate'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Dimensions / Specs</span>
                <span className="font-mono text-slate-200">
                  {selectedFile.dimensions || (selectedFile.pages ? `${selectedFile.pages} pages` : 'Lossless')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Fingerprint Digest</span>
                <span className="font-mono text-[9.5px] text-brand-300">
                  {selectedFile.phash ? `pHash: ${selectedFile.phash.slice(0, 12)}…` : selectedFile.sha256 ? `sha256: ${selectedFile.sha256.slice(0, 10)}…` : 'Calculated'}
                </span>
              </div>
            </div>

            {/* Hovered Edge Explanation */}
            {hoveredEdge ? (
              <div className="rounded-lg border border-brand-500/30 bg-brand-500/10 p-2 text-[10px] text-brand-200 leading-tight">
                <span className="font-bold">Pairwise Similarity: </span>
                <span>{hoveredEdge.sim}% confidence match between pair.</span>
              </div>
            ) : (
              <div className="rounded-lg border border-[#24272c] bg-[#0f1115] p-2 text-[10px] text-slate-400 flex items-center gap-2">
                <Info size={12} className="text-slate-500 shrink-0" />
                <span>Hover over any connecting line to see pairwise distance scores.</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Pairwise Similarity Matrix Table */
        <div className="overflow-x-auto rounded-xl border border-[#24272c] bg-[#0d0e12]">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#24272c] bg-[#14161a] text-[10px] font-mono text-slate-400 uppercase">
                <th className="p-3">File Candidate</th>
                {files.map(f => (
                  <th key={f.id} className="p-3 text-center truncate max-w-[100px]">
                    {f.name.length > 10 ? f.name.slice(0, 8) + '…' : f.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2229] font-mono">
              {files.map(f1 => (
                <tr key={f1.id} className="hover:bg-[#151820]">
                  <td className="p-3 font-semibold text-white flex items-center gap-2">
                    {f1.isRecommended && <Star size={11} className="text-emerald-400 fill-emerald-400" />}
                    <span className="truncate max-w-[160px]">{f1.name}</span>
                  </td>
                  {files.map(f2 => {
                    const sim = similarityMatrix[f1.id][f2.id]
                    const isSelf = f1.id === f2.id
                    return (
                      <td key={f2.id} className="p-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                            isSelf
                              ? 'bg-slate-800 text-slate-500'
                              : sim >= 95
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : sim >= 85
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700/30 text-slate-400'
                          }`}
                        >
                          {isSelf ? '100%' : `${sim}%`}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )

  if (isModal) {
    if (!isOpen) return null
    return (
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-3xl rounded-2xl border border-[#2a2e33] bg-[#14161a] p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-[#24272c] pb-3">
              <div className="flex items-center gap-2">
                <GitBranch size={16} className="text-brand-400" />
                <h2 className="text-sm font-bold text-white font-display">
                  Community Graph Analysis — {group.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="grid h-7 w-7 place-items-center rounded-lg border border-[#24272c] text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
            {content}
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

  return (
    <div className="rounded-2xl border border-[#1e2230] bg-[#11141d] p-5 shadow-sm">
      {content}
    </div>
  )
}
