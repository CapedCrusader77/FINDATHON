import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sliders, Columns, Eye, ZoomIn, ZoomOut, CheckCircle2, ShieldCheck, Star } from 'lucide-react'
import { DuplicateGroup, FileRecord } from '../types'
import { formatBytes } from '../lib/utils'
import { Badge, Button } from './ui'

interface ImageCompareModalProps {
  group: DuplicateGroup
  isOpen: boolean
  onClose: () => void
  onSelectKeep?: (fileId: string) => void
}

export default function ImageCompareModal({ group, isOpen, onClose, onSelectKeep }: ImageCompareModalProps) {
  const masterFile = group.files.find(f => f.isRecommended) || group.files[0]
  const [selectedCandidate, setSelectedCandidate] = useState<FileRecord>(
    group.files.find(f => !f.isRecommended) || group.files[1] || group.files[0]
  )
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [viewMode, setViewMode] = useState<'slider' | 'side-by-side' | 'difference'>('slider')
  const [zoomLevel, setZoomLevel] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || !isDragging) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setSliderPosition((x / rect.width) * 100)
  }

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const touch = e.touches[0]
    const x = Math.max(0, Math.min(touch.clientX - rect.left, rect.width))
    setSliderPosition((x / rect.width) * 100)
  }

  if (!isOpen) return null

  const masterImg = masterFile.imageUrl || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1000&q=85'
  const candidateImg = selectedCandidate.imageUrl || 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=50'
  const sizeReduction = Math.round(((masterFile.size - selectedCandidate.size) / masterFile.size) * 100)

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

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-[#222634] bg-[#11141d] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#1e2230] bg-[#0c0e14]/90 px-5 py-3.5 backdrop-blur-lg">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/15 text-brand-400 border border-brand-500/30">
                <Sliders size={16} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight">{group.title}</h3>
                  <Badge tone="purple">{group.similarity}% Visual Match</Badge>
                </div>
                <p className="text-[11px] text-slate-400">
                  Interactive Split Inspector · Compare resolution, compression noise, & EXIF tags
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {/* View mode switcher */}
              <div className="hidden sm:flex items-center rounded-lg border border-[#222634] bg-[#0c0e14] p-0.5 text-xs">
                <button
                  onClick={() => setViewMode('slider')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === 'slider' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sliders size={12} /> Split Slider
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === 'side-by-side' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Columns size={12} /> Side-by-Side
                </button>
                <button
                  onClick={() => setViewMode('difference')}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
                    viewMode === 'difference' ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Eye size={12} /> Heatmap Diff
                </button>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center gap-1 rounded-lg border border-[#222634] bg-[#0c0e14] p-0.5">
                <button
                  onClick={() => setZoomLevel(prev => Math.max(0.75, prev - 0.25))}
                  className="rounded p-1 text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="px-1 text-[10px] font-mono font-medium text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.25))}
                  className="rounded p-1 text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              <button
                onClick={onClose}
                className="grid h-8 w-8 place-items-center rounded-lg border border-[#222634] text-slate-400 hover:bg-[#1b1f2b] hover:text-white transition-colors"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Main Visual Arena */}
          <div className="grid flex-1 overflow-hidden lg:grid-cols-[1fr_340px]">
            {/* Viewport Canvas */}
            <div className="relative flex flex-col items-center justify-center overflow-hidden bg-[#0c0e14] p-4 sm:p-6 select-none">
              {viewMode === 'slider' && (
                <div
                  ref={containerRef}
                  onMouseDown={() => setIsDragging(true)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative h-full max-h-[580px] w-full max-w-[800px] cursor-ew-resize overflow-hidden rounded-xl border border-[#222634] bg-[#11141d] shadow-2xl"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  {/* Candidate Image (Underneath / Right) */}
                  <img
                    src={candidateImg}
                    alt={selectedCandidate.name}
                    className="absolute inset-0 h-full w-full object-contain filter contrast-95 brightness-95"
                  />
                  <div className="absolute right-3 top-3 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-rose-300 backdrop-blur-md border border-rose-500/30">
                    Candidate Copy ({selectedCandidate.dimensions || '1080p'})
                  </div>

                  {/* Master Image (Top Layer / Clipped on Left) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                  >
                    <img
                      src={masterImg}
                      alt={masterFile.name}
                      className="absolute inset-0 h-full w-full object-contain"
                    />
                    <div className="absolute left-3 top-3 rounded-md bg-black/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 backdrop-blur-md border border-emerald-500/30 inline-flex items-center gap-1">
                      <Star size={10} className="fill-emerald-400 text-emerald-400" />
                      <span>Master Original ({masterFile.dimensions || '4K'})</span>
                    </div>
                  </div>

                  {/* Draggable Divider Line */}
                  <div
                    className="absolute inset-y-0 w-0.5 bg-brand-400 shadow-[0_0_10px_rgba(99,102,241,0.8)]"
                    style={{ left: `${sliderPosition}%` }}
                  >
                    <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-brand-600 text-white shadow-sm">
                      <Sliders size={12} className="rotate-90" />
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'side-by-side' && (
                <div
                  className="grid h-full max-h-[580px] w-full max-w-[840px] grid-cols-2 gap-3"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-[#11141d]">
                    <img src={masterImg} alt={masterFile.name} className="h-full w-full object-contain" />
                    <div className="absolute left-2.5 top-2.5 rounded-md bg-emerald-950/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                      <Star size={10} className="fill-emerald-400 text-emerald-400" />
                      <span>Master: {masterFile.name}</span>
                    </div>
                  </div>
                  <div className="relative overflow-hidden rounded-xl border border-[#222634] bg-[#11141d]">
                    <img src={candidateImg} alt={selectedCandidate.name} className="h-full w-full object-contain filter contrast-95" />
                    <div className="absolute left-2.5 top-2.5 rounded-md bg-[#0c0e14]/90 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-white/10">
                      Candidate: {selectedCandidate.name}
                    </div>
                  </div>
                </div>
              )}

              {viewMode === 'difference' && (
                <div
                  className="relative h-full max-h-[580px] w-full max-w-[800px] overflow-hidden rounded-xl border border-indigo-500/30 bg-[#11141d]"
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                >
                  <img src={masterImg} alt="Master" className="h-full w-full object-contain filter invert hue-rotate-180 opacity-70" />
                  <img src={candidateImg} alt="Candidate" className="absolute inset-0 h-full w-full object-contain mix-blend-difference" />
                  <div className="absolute left-3 top-3 rounded-md bg-indigo-950/90 px-2.5 py-1 text-[11px] font-semibold text-indigo-200 border border-indigo-500/40">
                    Difference Mask: Black = identical pixels · Color = compression / cropping artifacts
                  </div>
                </div>
              )}

              {/* Instruction */}
              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                <span>Drag the vertical slider across the image to evaluate sharpness.</span>
              </div>
            </div>

            {/* Sidebar Inspector */}
            <div className="flex flex-col border-t lg:border-t-0 lg:border-l border-[#1e2230] bg-[#11141d] p-4.5 overflow-y-auto">
              {/* Candidate Version Selector */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Select Comparison Target
                </p>
                <div className="mt-2 space-y-1.5">
                  {group.files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => setSelectedCandidate(file)}
                      className={`flex w-full items-center justify-between rounded-lg border p-2 text-left text-xs transition-colors ${
                        selectedCandidate.id === file.id
                          ? 'border-brand-500/60 bg-brand-950/30 text-white'
                          : 'border-[#1e2230] bg-[#0c0e14] text-slate-400 hover:border-[#2f374e] hover:text-white'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-semibold text-slate-200 text-xs">{file.name}</span>
                          {file.isRecommended && (
                            <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[8px] font-bold text-emerald-300">
                              MASTER
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-500 font-mono">
                          {formatBytes(file.size)} · {file.dimensions || 'N/A'}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold font-mono text-brand-400 shrink-0">
                        {file.isRecommended ? '100%' : `${file.quality}% quality`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical Comparison Table */}
              <div className="mt-4 rounded-lg border border-[#1e2230] bg-[#0c0e14] p-3.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-brand-300">
                  Detailed Metric Divergence
                </p>
                <div className="mt-2.5 space-y-2 text-xs">
                  <div className="flex justify-between border-b border-[#1e2230] pb-1.5">
                    <span className="text-slate-400 text-[11px]">Resolution</span>
                    <div className="text-right text-[11px] font-mono">
                      <span className="font-semibold text-emerald-400">{masterFile.dimensions || '6000×4000'}</span>
                      <span className="text-slate-600"> vs </span>
                      <span className="font-semibold text-rose-400">{selectedCandidate.dimensions || '1920×1280'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-[#1e2230] pb-1.5">
                    <span className="text-slate-400 text-[11px]">File Weight</span>
                    <div className="text-right text-[11px] font-mono">
                      <span className="font-semibold text-slate-200">{formatBytes(masterFile.size)}</span>
                      <span className="text-slate-600"> vs </span>
                      <span className="font-semibold text-brand-300">{formatBytes(selectedCandidate.size)}</span>
                      {sizeReduction > 0 && (
                        <span className="ml-1 text-[10px] text-amber-400">(-{sizeReduction}%)</span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between border-b border-[#1e2230] pb-1.5">
                    <span className="text-slate-400 text-[11px]">pHash Hex</span>
                    <span className="font-mono text-[10px] text-brand-300">{masterFile.phash || 'd4e5f6a1'}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[11px]">Camera EXIF</span>
                    <span className="font-medium text-slate-300 text-[11px]">{masterFile.exif?.camera || 'Sony α7 IV'}</span>
                  </div>
                </div>
              </div>

              {/* Recommendation Callout */}
              <div className="mt-4 rounded-lg border border-emerald-500/25 bg-emerald-950/15 p-3">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck size={14} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Algorithmic Decision</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-emerald-200/80">
                  {group.recommendationReason}
                </p>
              </div>

              {/* Actions */}
              <div className="mt-auto pt-4 flex flex-col gap-2">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs h-8.5"
                  onClick={() => {
                    if (onSelectKeep) onSelectKeep(masterFile.id)
                    onClose()
                  }}
                >
                  <CheckCircle2 size={13} />
                  <span>Keep {masterFile.name} as Master</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={onClose}>
                  Done Inspecting
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
